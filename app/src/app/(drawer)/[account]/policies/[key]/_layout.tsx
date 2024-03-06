import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { gql } from '@api';
import { Stack } from 'expo-router';
import { atom } from 'jotai';
import { PolicyKey, ZERO_ADDR, asChain, asPolicyKey } from 'lib';
import { useMemo } from 'react';
import { z } from 'zod';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { PolicyDraft, PolicyDraftContext, policyAsDraft } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { zUAddress } from '~/lib/zod';

const Query = gql(/* GraphQL */ `
  query PolicyLayout($account: UAddress!, $key: PolicyKey!, $includePolicy: Boolean!) {
    policy(input: { account: $account, key: $key }) @include(if: $includePolicy) {
      id
      key
      name
      state {
        id
        ...policyAsDraft_PolicyState
      }
      draft {
        id
        ...policyAsDraft_PolicyState
      }
    }

    account(input: { account: $account }) {
      id
      address
      ...UsePolicyPresets_Account
    }

    user {
      id
      ...UsePolicyPresets_User
    }
  }
`);

export const unstable_settings = {
  initialRouteName: `index`,
};

export const PolicyLayoutParams = z.object({
  account: zUAddress(),
  key: z.union([z.coerce.number().transform(asPolicyKey), z.literal('add')]),
  draft: z.coerce.boolean().optional(),
});
export type PolicyLayoutParams = z.infer<typeof PolicyLayoutParams>;

export default function PolicyLayout() {
  const params = useLocalParams(PolicyLayoutParams);
  const key = params.key === 'add' ? undefined : asPolicyKey(params.key);

  const { policy, account, user } = useQuery(Query, {
    account: params.account,
    key: key ?? (0 as PolicyKey),
    includePolicy: key !== undefined,
  }).data;
  const view = (params.draft && policy?.draft && 'draft') || 'state';

  const presets = usePolicyPresets({
    account,
    user,
    chain: account ? asChain(account.address) : 'zksync', // Should only occur whilst loading
  });

  const initial = useMemo((): PolicyDraft => {
    return {
      account: account?.address ?? `zksync:${ZERO_ADDR}`, // Should only occur whilst loading
      key: policy?.key,
      name: policy?.name || '',
      ...((view === 'state' && policy?.state && policyAsDraft(policy.state)) ||
        (policy?.draft && policyAsDraft(policy.draft)) ||
        (policy?.state && policyAsDraft(policy.state)) ||
        presets.low),
    };
  }, [account, policy?.draft, policy?.key, policy?.name, policy?.state, presets.low, view]);

  const draftAtom = useMemo(() => atom(initial), [initial]);

  return (
    <PolicyDraftContext.Provider value={{ draftAtom, initial, view }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack screenOptions={{ header: AppbarHeader }} />
    </PolicyDraftContext.Provider>
  );
}
