import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { UAddress } from 'lib';
import { useRequestTokensMutation, useRequestTokensMutation$data } from '~/api/__generated__/useRequestTokensMutation.graphql';
import { useRequestTokensUpdatableQuery } from '~/api/__generated__/useRequestTokensUpdatableQuery.graphql';

export function useRequestTokens() {
  const commit = useMutation<useRequestTokensMutation>(graphql`
    mutation useRequestTokensMutation($account: UAddress!) @raw_response_type {
      requestTokens(input: { account: $account })
    }
  `);

  return (account: UAddress) => {
    const updater: SelectorStoreUpdater<useRequestTokensMutation$data> = (store, data) => {
      if (!data?.requestTokens) return;

      // TODO: invalidate data.requestTokens balances

      const { updatableData } = store.readUpdatableQuery<useRequestTokensUpdatableQuery>(
        graphql`
          query useRequestTokensUpdatableQuery($account: UAddress!) @updatable {
            requestableTokens(input: { account: $account })
          }
        `,
        { account },
      );
      updatableData.requestableTokens = [];
    };

    return commit(
      { account },
      {
        optimisticResponse: { requestTokens: [] },
        optimisticUpdater: updater,
        updater,
      },
    );
  };
}

export { ErrorBoundary } from '#/ErrorBoundary';
