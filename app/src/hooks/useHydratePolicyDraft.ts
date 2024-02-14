import { FragmentType, gql, useFragment } from '@api';
import { useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { ZERO_ADDR, asChain } from 'lib';
import { useEffect, useMemo } from 'react';
import { POLICY_DRAFT_ATOM, PolicyDraft, policyAsDraft } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';

const Account = gql(/* GraphQL */ `
  fragment useHydratePolicyDraft_Account on Account {
    id
    address
    ...UsePolicyPresets_Account
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

const User = gql(/* GraphQL */ `
  fragment useHydratePolicyDraft_User on User {
    id
    ...UsePolicyPresets_User
  }
`);

export type PolicyView = 'state' | 'draft';

export interface UseHydratePolicyDraftParams {
  account: FragmentType<typeof Account> | null | undefined;
  policy: FragmentType<typeof Policy> | null | undefined;
  user: FragmentType<typeof User>;
  view: PolicyView;
}

export function useHydratePolicyDraft(params: UseHydratePolicyDraftParams) {
  const account = useFragment(Account, params.account);
  const policy = useFragment(Policy, params.policy);
  const user = useFragment(User, params.user);
  const presets = usePolicyPresets({
    account,
    user,
    chain: account ? asChain(account.address) : 'zksync', // Should only occur whilst loading
  });

  const init = useMemo(
    (): PolicyDraft => ({
      account: account?.address ?? `zksync:${ZERO_ADDR}`, // Should only occur whilst loading
      key: policy?.key,
      name: policy?.name || '',
      ...((params.view === 'state' && policy?.state && policyAsDraft(policy.state)) ||
        (policy?.draft && policyAsDraft(policy.draft)) ||
        (policy?.state && policyAsDraft(policy.state)) ||
        presets.low),
    }),
    [
      account?.address,
      policy?.key,
      policy?.name,
      policy?.state,
      policy?.draft,
      params.view,
      presets.low,
    ],
  );

  const setDraft = useSetAtom(POLICY_DRAFT_ATOM);
  useHydrateAtoms([[POLICY_DRAFT_ATOM, init]]);
  useEffect(() => {
    setDraft(init);
  }, [init, setDraft]);

  return { init };
}
