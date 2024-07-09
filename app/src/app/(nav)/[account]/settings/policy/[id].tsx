import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { z } from 'zod';
import { ZERO_UUID, zUAddress, zUuid } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { usePolicyPresets } from '~/lib/policy/usePolicyPresets';
import { ZERO_ADDR, asChain } from 'lib';
import { useMemo } from 'react';
import { PolicyDraft, PolicyDraftContext, policyAsDraft } from '~/lib/policy/policyAsDraft';
import { atom } from 'jotai';
import { PolicyPane } from '#/policy/PolicyPane';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { Id_PolicyScreenQuery } from '~/api/__generated__/Id_PolicyScreenQuery.graphql';

const Query = graphql`
  query Id_PolicyScreenQuery($account: UAddress!, $policy: ID!, $includePolicy: Boolean!) {
    account(address: $account) @required(action: THROW) {
      id
      address
      ...usePolicyPresets_account
      ...PolicyPane_account
    }

    policy: node(id: $policy) @include(if: $includePolicy) {
      __typename
      ... on Policy {
        id
        key
        name
      }
      ... on Policy @alias(as: "policyAsDraft") {
        ...policyAsDraft_policy
      }
      ...PolicyPane_policy @alias
    }

    user {
      id
      ...usePolicyPresets_user
      ...PolicyPane_user
    }
  }
`;

export const PolicyScreenParams = z.object({
  account: zUAddress(),
  id: z.union([zUuid(), z.literal('add')]),
});

function PolicyScreen() {
  const params = useLocalParams(PolicyScreenParams);
  const id = params.id !== 'add' ? params.id : undefined;

  const { account, policy, user } = useLazyLoadQuery<Id_PolicyScreenQuery>(Query, {
    account: params.account,
    policy: id ?? ZERO_UUID,
    includePolicy: !!id,
  });

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
      ...(p?.policyAsDraft
        ? policyAsDraft(p.policyAsDraft)
        : {
            ...presets.low,
            key: undefined,
            name: 'New policy',
          }),
    };
  }, [account?.address, policy, presets.low]);

  const draftAtom = useMemo(() => atom(initial), [initial]);

  if (policy && policy.__typename !== 'Policy') return null;

  return (
    <PolicyDraftContext.Provider value={draftAtom}>
      <PolicyPane
        initial={initial}
        account={account}
        policy={policy?.PolicyPane_policy}
        user={user}
      />
    </PolicyDraftContext.Provider>
  );
}

export default withSuspense(PolicyScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
