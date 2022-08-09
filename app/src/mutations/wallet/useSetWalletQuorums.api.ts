import { ApolloCache, gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { CombinedWallet } from '~/queries/wallets';
import {
  API_WALLET_FIELDS,
  API_QUERY_USER_WALLETS,
} from '~/queries/wallets/useWallets.api';
import {
  UserWalletsQuery,
  useSetWalletQuorumsMutation,
} from '@gql/generated.api';

gql`
  ${API_WALLET_FIELDS}

  mutation SetWalletQuorums(
    $setQuroumsId: WalletId!
    $quorums: [QuorumScalar!]!
    $txHash: Bytes32!
  ) {
    setWalletQuroums(id: $setQuroumsId, quorums: $quorums, txHash: $txHash) {
      ...WalletFields
    }
  }
`;

export const updateApiUserWalletsCache = (
  cache: ApolloCache<any>,
  wallets: UserWalletsQuery['userWallets'],
) => {
  const opts: QueryOpts<never> = { query: API_QUERY_USER_WALLETS };
  const data: UserWalletsQuery = cache.readQuery<UserWalletsQuery>(opts) ?? {
    userWallets: [],
  };

  cache.writeQuery<UserWalletsQuery>({
    ...opts,
    overwrite: true,
    data: produce(data, (data) => {
      if (!data.userWallets) data.userWallets = [];

      for (const wallet of wallets) {
        const i = data.userWallets.findIndex((a) => a.id === wallet.id);
        if (i >= 0) {
          data.userWallets[i] = wallet;
        } else {
          data.userWallets.push(wallet);
        }
      }
    }),
  });
};

export const useApiSetWalletQuorums = () => {
  const [mutation] = useSetWalletQuorumsMutation({ client: useApiClient() });

  const upsert = (
    { id, accountAddr, ref, name, quorums }: CombinedWallet,
    txHash: string,
  ) =>
    mutation({
      variables: {
        setQuroumsId: {
          accountId: accountAddr,
          ref,
        },
        quorums: quorums.map((quorum) =>
          quorum.approvers.map((approver) => ({
            userId: approver,
          })),
        ),
        txHash,
      },
      optimisticResponse: {
        setWalletQuroums: {
          __typename: 'Wallet',
          id,
          accountId: accountAddr,
          ref,
          name,
          quorums: quorums.map((quorum) => ({
            __typename: 'Quorum',
            approvers: quorum.approvers.map((approver) => ({
              __typename: 'Approver',
              userId: approver,
            })),
          })),
        },
      },
      update: (cache, res) => {
        const acc = res?.data?.setWalletQuroums;
        if (acc?.__typename) updateApiUserWalletsCache(cache, [acc]);
      },
    });

  return upsert;
};
