import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { CombinedWallet } from '~/queries/wallets';
import {
  useUpsertWalletMutation,
  WalletQuery,
  WalletQueryVariables,
} from '@gql/generated.api';
import { API_QUERY_WALLET } from '~/queries/wallets/useWallet.api';

gql`
  mutation UpsertWallet(
    $wallet: WalletId!
    $name: String
    $quorums: [QuorumScalar!]!
    $txHash: Bytes32!
  ) {
    upsertWallet(id: $wallet, name: $name, quorums: $quorums, txHash: $txHash) {
      id
    }
  }
`;

export const useApiUpsertWallet = () => {
  const [mutation] = useUpsertWalletMutation({ client: useApiClient() });

  const upsert = (
    { id, accountAddr, ref, name, quorums }: CombinedWallet,
    txHash: string,
  ) =>
    mutation({
      variables: {
        wallet: {
          accountId: accountAddr,
          ref,
        },
        name,
        quorums: quorums.map((quorum) =>
          quorum.approvers.map((approver) => ({
            userId: approver,
          })),
        ),
        txHash,
      },
      optimisticResponse: {
        upsertWallet: {
          __typename: 'Wallet',
          id,
        },
      },
      update: (cache, res) => {
        if (!res.data?.upsertWallet) return;

        // Wallet; upsert quorums
        const opts: QueryOpts<WalletQueryVariables> = {
          query: API_QUERY_WALLET,
          variables: { wallet: { accountId: accountAddr, ref } },
        };

        const data: WalletQuery = cache.readQuery<WalletQuery>(opts) ?? {
          wallet: null,
        };

        cache.writeQuery<WalletQuery>({
          ...opts,
          overwrite: true,
          data: produce(data, (data) => {
            if (!data.wallet)
              data.wallet = {
                id,
                accountId: accountAddr,
                ref,
                name,
              };

            data.wallet.name = name;
            data.wallet.quorums = quorums.map((q) => ({
              __typename: 'Quorum',
              approvers: q.approvers.map((approver) => ({
                __typename: 'Approver',
                userId: approver,
              })),
            }));
          }),
        });
      },
    });

  return upsert;
};
