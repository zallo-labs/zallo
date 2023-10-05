import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useMemo } from 'react';
import { POLICY_DRAFT_ATOM, PolicyDraft } from './PolicyDraft';
import { useSyncAtom } from '~/hooks/useSyncAtom';
import { PolicyTemplateType, usePolicyTemplates } from '../add-policy/usePolicyTemplate';

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

const Account = gql(/* GraphQL */ `
  fragment UseHydratePolicyDraft_Account on Account {
    id
    address
    ...UsePolicyTemplate_Account
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
  accountFragment: FragmentType<typeof Account> | null | undefined,
  policyFragment: FragmentType<typeof Policy> | null | undefined,
  view: 'active' | 'draft',
  templateType: PolicyTemplateType,
) {
  const account = getFragment(Account, accountFragment);
  const policy = getFragment(Policy, policyFragment);
  const template = usePolicyTemplates(account)[templateType];

  const init = useMemo(
    (): PolicyDraft => ({
      account: account?.address || '0x',
      key: policy?.key,
      name: policy?.name ?? template.name,
      ...((view === 'active' && stateAsPolicy(policy?.state)) ||
        stateAsPolicy(policy?.draft) ||
        template),
    }),
    [account, policy, view, template],
  );

  useSyncAtom(POLICY_DRAFT_ATOM, init);

  return init;
}

function stateAsPolicy(
  stateFragment: FragmentType<typeof PolicyState> | null | undefined,
): Pick<PolicyDraft, 'approvers' | 'threshold' | 'permissions'> | undefined {
  const s = getFragment(PolicyState, stateFragment);
  if (!s) return undefined;

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
