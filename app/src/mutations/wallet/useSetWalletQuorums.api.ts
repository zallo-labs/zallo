import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { CombinedWallet } from '~/queries/wallets';
import {
  useSetWalletQuorumsMutation,
  WalletQuery,
  WalletQueryVariables,
} from '@gql/generated.api';
import { API_QUERY_WALLET } from '~/queries/wallets/useWallet.api';

gql`
  mutation SetWalletQuorums(
    $setQuroumsId: WalletId!
    $quorums: [QuorumScalar!]!
    $txHash: Bytes32!
  ) {
    setWalletQuroums(id: $setQuroumsId, quorums: $quorums, txHash: $txHash) {
      id
    }
  }
`;

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
        },
      },
      update: (cache, res) => {
        if (!res.data?.setWalletQuroums) return;

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
