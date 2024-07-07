import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { useUpsertToken_query$key } from '~/api/__generated__/useUpsertToken_query.graphql';
import {
  UpsertTokenInput,
  useUpsertTokenMutation,
  useUpsertTokenMutation$data,
} from '~/api/__generated__/useUpsertTokenMutation.graphql';
import { asChain } from 'lib';
import { useUpsertTokenUpdatableQuery } from '~/api/__generated__/useUpsertTokenUpdatableQuery.graphql';
import { randomUUID } from '~/lib/id';

graphql`
  fragment useUpsertToken_assignable_token on Token @assignable {
    __typename
  }
`;

export interface UpsertTokenParams {
  query: useUpsertToken_query$key;
}

export function useUpsertToken(params: UpsertTokenParams) {
  const { tokens } = useFragment(
    graphql`
      fragment useUpsertToken_query on Query @argumentDefinitions(chain: { type: "Chain!" }) {
        tokens(input: { chain: $chain, query: null }) {
          id
          address
          ...useUpsertToken_assignable_token
        }
      }
    `,
    params.query,
  );

  const commit = useMutation<useUpsertTokenMutation>(graphql`
    mutation useUpsertTokenMutation($input: UpsertTokenInput!) @raw_response_type {
      upsertToken(input: $input) {
        id
        address
        name
        symbol
        icon
        pythUsdPriceId
        ...useUpsertToken_assignable_token
      }
    }
  `);

  return (input: UpsertTokenInput) => {
    const updater: SelectorStoreUpdater<useUpsertTokenMutation$data> = (store, data) => {
      if (!data?.upsertToken) return;

      const { updatableData } = store.readUpdatableQuery<useUpsertTokenUpdatableQuery>(
        graphql`
          query useUpsertTokenUpdatableQuery($address: UAddress!, $chain: Chain!) @updatable {
            token(address: $address) {
              ...useUpsertToken_assignable_token
            }

            tokens(input: { chain: $chain, query: null }) {
              ...useUpsertToken_assignable_token
            }
          }
        `,
        { address: data.upsertToken.address, chain: asChain(data.upsertToken.address) },
      );

      updatableData.token = data.upsertToken;
      updatableData.tokens = [
        ...tokens.filter((t) => t.address !== data.upsertToken.address),
        data.upsertToken,
      ];
    };

    return commit(
      { input },
      {
        optimisticResponse: {
          upsertToken: {
            __typename: 'Token',
            id: randomUUID(),
            address: input.address,
            name: input.name!,
            symbol: input.symbol!,
            icon: input.icon,
            pythUsdPriceId: input.pythUsdPriceId,
          },
        },
        optimisticUpdater: updater,
        updater,
      },
    );
  };
}
