import { FragmentType, gql, useFragment } from '@api';
import { useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { ZERO_ADDR } from 'lib';
import { useEffect, useMemo } from 'react';
import { POLICY_DRAFT_ATOM, PolicyDraft, policyAsDraft } from '~/lib/policy/draft';
import { getPolicyPresets } from '~/lib/policy/presets';

const Account = gql(/* GraphQL */ `
  fragment useHydratePolicyDraft_Account on Account {
    id
    address
    ...getPolicyTemplate_Account
  }
`);

const Policy = gql(/* GraphQL */ `
  fragment useHydratePolicyDraft_Policy on Policy {
    id
    key
    name
    state {
      ...policyAsDraft_PolicyState
    }
    draft {
      ...policyAsDraft_PolicyState
    }
  }
`);

export type PolicyView = 'state' | 'draft';

export interface UseHydratePolicyDraftParams {
  account: FragmentType<typeof Account> | null | undefined;
  policy: FragmentType<typeof Policy> | null | undefined;
  view: PolicyView;
}

export function useHydratePolicyDraft(params: UseHydratePolicyDraftParams) {
  const account = useFragment(Account, params.account);
  const policy = useFragment(Policy, params.policy);

  const init = useMemo(
    (): PolicyDraft => ({
      account: account?.address ?? ZERO_ADDR,
      key: policy?.key,
      name: policy?.name || '',
      ...((params.view === 'state' && policy?.state && policyAsDraft(policy.state)) ||
        (policy?.draft && policyAsDraft(policy.draft)) ||
        (policy?.state && policyAsDraft(policy.state)) ||
        (account
          ? getPolicyPresets(account).high
          : {
              approvers: new Set(),
              threshold: 0,
              actions: [],
              transfers: { defaultAllow: false, limits: {} },
            })),
    }),
    [account, policy, params.view],
  );

  const setDraft = useSetAtom(POLICY_DRAFT_ATOM);
  useHydrateAtoms([[POLICY_DRAFT_ATOM, init]]);
  useEffect(() => {
    setDraft(init);
  }, [init]);

  return { init };
}
