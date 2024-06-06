import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { gql } from '@api';
import { z } from 'zod';
import { useQuery } from '~/gql';
import { ZERO_UUID, zUAddress, zUuid } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { ZERO_ADDR, asChain } from 'lib';
import { useMemo } from 'react';
import { PolicyDraft, PolicyDraftContext, policyAsDraft } from '~/lib/policy/draft';
import { atom } from 'jotai';
import { PolicyPane } from '#/policy/PolicyPane';
import { NotFound } from '#/NotFound';

const Query = gql(/* GraphQL */ `
  query Policy($account: UAddress!, $policy: ID!, $includePolicy: Boolean!) {
    account(input: { account: $account }) {
      id
      address
      ...UsePolicyPresets_Account
      ...PolicyPane_Account
    }

    policy: node(id: $policy) @include(if: $includePolicy) {
      __typename
      ... on Policy {
        id
        key
        name
        ...policyAsDraft_Policy
      }
      ...PolicyPane_Policy
    }

    user {
      id
      ...UsePolicyPresets_User
      ...PolicyPane_User
    }
  }
`);

export const PolicyScreenParams = z.object({
  account: zUAddress(),
  id: z.union([zUuid(), z.literal('add')]),
});

function PolicyScreen() {
  const params = useLocalParams(PolicyScreenParams);
  const id = params.id !== 'add' ? params.id : undefined;

  const { account, policy, user } = useQuery(Query, {
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

  const draftAtom = useMemo(() => atom(initial), [initial]);

  if (!account) return <NotFound name="Account" />;
  if (policy && policy.__typename !== 'Policy') return null;

  return (
    <PolicyDraftContext.Provider value={draftAtom}>
      <PolicyPane initial={initial} account={account} policy={policy} user={user} />
    </PolicyDraftContext.Provider>
  );
}

export default withSuspense(PolicyScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
