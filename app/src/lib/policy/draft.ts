import { FragmentType, gql, useFragment as getFragment } from '@api';
import { PolicyInput } from '@api/generated/graphql';
import { atom } from 'jotai';
import { Address, PolicyKey, Selector, Permissions } from 'lib';

export interface PolicyDraft {
  account: Address;
  key?: PolicyKey;
  name: string;
  approvers: Set<Address>;
  threshold: number;
  permissions: Permissions;
}

export const POLICY_DRAFT_ATOM = atom<PolicyDraft>({} as PolicyDraft);

const PolicyState = gql(/* GraphQL */ `
  fragment policyAsDraft_PolicyState on PolicyState {
    id
    approvers {
      id
      address
    }
    threshold
    targets {
      id
      contracts {
        id
        contract
        functions {
          selector
          allow
        }
        defaultAllow
      }
      default {
        id
        functions {
          selector
          allow
        }
        defaultAllow
      }
    }
    transfers {
      id
      limits {
        id
        token
        amount
        duration
      }
      defaultAllow
      budget
    }
  }
`);

export function policyAsDraft(
  stateFragment: FragmentType<typeof PolicyState>,
): Pick<PolicyDraft, 'approvers' | 'threshold' | 'permissions'> | undefined {
  const s = getFragment(PolicyState, stateFragment);

  return {
    approvers: new Set(s.approvers.map((a) => a.address)),
    threshold: s.threshold,
    permissions: {
      targets: {
        default: {
          functions: Object.fromEntries(
            s.targets.default.functions.map((f) => [f.selector, f.allow]),
          ),
          defaultAllow: s.targets.default.defaultAllow,
        },
        contracts: Object.fromEntries(
          s.targets.contracts.map((c) => [
            c.contract,
            {
              functions: Object.fromEntries(c.functions.map((f) => [f.selector, f.allow])),
              defaultAllow: c.defaultAllow,
            },
          ]),
        ),
      },
      transfers: {
        limits: Object.fromEntries(
          s.transfers.limits.map((l) => [
            l.token,
            {
              amount: BigInt(l.amount),
              duration: l.duration,
            },
          ]),
        ),
        defaultAllow: s.transfers.defaultAllow,
        budget: s.transfers.budget,
      },
    },
  };
}

export function asPolicyInput(p: PolicyDraft): PolicyInput {
  return {
    key: p.key,
    name: p.name,
    approvers: [...p.approvers],
    threshold: p.threshold,
    permissions: {
      targets: {
        contracts: Object.entries(p.permissions.targets.contracts).map(([contract, target]) => ({
          contract: contract as Address,
          functions: Object.entries(target.functions).map(([selector, allow]) => ({
            selector: selector as Selector,
            allow,
          })),
          defaultAllow: target.defaultAllow,
        })),
        default: {
          functions: Object.entries(p.permissions.targets.default.functions).map(
            ([selector, allow]) => ({
              selector: selector as Selector,
              allow,
            }),
          ),
          defaultAllow: p.permissions.targets.default.defaultAllow,
        },
      },
      transfers: {
        limits: Object.entries(p.permissions.transfers.limits).map(([token, limit]) => ({
          token: token as Address,
          amount: limit.amount,
          duration: limit.duration,
        })),
        budget: p.permissions.transfers.budget,
        defaultAllow: p.permissions.transfers.defaultAllow,
      },
    },
  };
}
