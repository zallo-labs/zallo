import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { gql } from '@api';
import { Stack } from 'expo-router';
import { atom } from 'jotai';
import { ZERO_ADDR, asChain, asUUID } from 'lib';
import { useMemo } from 'react';
import { z } from 'zod';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { PolicyDraft, PolicyDraftContext, policyAsDraft } from '~/lib/policy/draft';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { zUAddress, zUuid } from '~/lib/zod';

const Query = gql(/* GraphQL */ `
  query PolicyLayout($account: UAddress!, $policy: ID!, $includePolicy: Boolean!) {
    policy: node(id: $policy) @include(if: $includePolicy) {
      __typename
      ... on Policy {
        id
        key
        name
        ...policyAsDraft_Policy
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

export const ZERO_UUID = asUUID('00000000-0000-0000-0000-000000000000');

export const unstable_settings = {
  initialRouteName: `index`,
};

export const PolicyLayoutParams = z.object({
  account: zUAddress(),
  id: z.union([zUuid(), z.literal('add')]),
});
export type PolicyLayoutParams = z.infer<typeof PolicyLayoutParams>;

function PolicyLayout() {
  const params = useLocalParams(PolicyLayoutParams);
  const id = params.id !== 'add' ? params.id : undefined;

  const { policy, account, user } = useQuery(Query, {
    account: params.account,
    policy: id ?? ZERO_UUID,
    includePolicy: !!id,
  }).data;

  const presets = usePolicyPresets({
    account,
    user,
    chain: account ? asChain(account.address) : 'zksync', // Should only occur whilst loading
  });

  const initial = useMemo((): PolicyDraft => {
    const p = policy?.__typename === 'Policy' ? policy : undefined;
    return {
      account: account?.address ?? `zksync:${ZERO_ADDR}`, // Should only occur whilst loading
      key: p?.key,
      name: p?.name || '',
      ...((p && policyAsDraft(p)) || presets.low),
    };
  }, [account?.address, policy, presets.low]);

  const ctx = useMemo(() => ({ id, draftAtom: atom(initial), initial }), [id, initial]);

  return (
    <PolicyDraftContext.Provider value={ctx}>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack screenOptions={{ header: (props) => <AppbarHeader {...props} /> }} />
    </PolicyDraftContext.Provider>
  );
}

export default withSuspense(PolicyLayout, <ScreenSkeleton />);
