import { ALLOW_ALL_TARGETS, ALLOW_ALL_TRANSFERS_CONFIG, Address } from 'lib';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useMemo } from 'react';
import { useApproverAddress } from '@network/useApprover';
import { POLICY_DRAFT_ATOM, PolicyDraft } from './PolicyDraft';
import { useSyncAtom } from '~/util/useSyncAtom';

const PolicyState = gql(/* GraphQL */ `
  fragment UseHydratePolicyDraft_PolicyState on PolicyState {
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

const Policy = gql(/* GraphQL */ `
  fragment UseHydratePolicyDraft_Policy on Policy {
    id
    key
    name
    state {
      ...UseHydratePolicyDraft_PolicyState
    }
    draft {
      ...UseHydratePolicyDraft_PolicyState
    }
  }
`);

export function useHydratePolicyDraft(
  account: Address,
  policyFragment: FragmentType<typeof Policy> | null | undefined,
  view: 'active' | 'draft',
) {
  const policy = getFragment(Policy, policyFragment);
  const approver = useApproverAddress();

  const init = useMemo(
    (): PolicyDraft => ({
      account,
      key: policy?.key,
      name: policy?.name ?? 'New policy',
      ...(view === 'active' && policy?.state
        ? stateAsPolicy(policy.state)
        : policy?.draft
        ? stateAsPolicy(policy.draft)
        : {
            permissions: {
              targets: ALLOW_ALL_TARGETS,
              transfers: ALLOW_ALL_TRANSFERS_CONFIG,
            },
            approvers: new Set([approver]),
            threshold: 1,
          }),
    }),
    [account, approver, policy, view],
  );

  useSyncAtom(POLICY_DRAFT_ATOM, init);

  return init;
}

function stateAsPolicy(
  stateFragment: FragmentType<typeof PolicyState>,
): Pick<PolicyDraft, 'approvers' | 'threshold' | 'permissions'> {
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
