import { gql } from '@apollo/client';
import { useApiClient } from '@gql/GqlProvider';
import { CombinedWallet } from '~/queries/wallets';
import {
  useUpsertWalletMutation,
  WalletQuery,
  WalletQueryVariables,
} from '@gql/generated.api';
import {
  API_QUERY_WALLET,
  API_WALLET_FIELDS,
} from '~/queries/wallets/useWallet.api';

gql`
  ${API_WALLET_FIELDS}

  mutation UpsertWallet(
    $wallet: WalletId!
    $name: String
    $quorums: [QuorumScalar!]!
    $txHash: Bytes32!
  ) {
    upsertWallet(
      id: $wallet
      name: $name
      quorums: $quorums
      proposalHash: $txHash
    ) {
      ...WalletFields
    }
  }
`;

export const useApiUpsertWallet = () => {
  const [mutation] = useUpsertWalletMutation({ client: useApiClient() });

  const upsert = (w: CombinedWallet, txHash: string) => {
    const quorums = w.quorums.filter((q) => q.state !== 'removed');

    return mutation({
      variables: {
        wallet: {
          accountId: w.accountAddr,
          ref: w.ref,
        },
        name: w.name,
        quorums: quorums.map((quorum) => quorum.approvers),
        txHash,
      },
      optimisticResponse: {
        upsertWallet: {
          __typename: 'Wallet',
          id: w.id,
          accountId: w.accountAddr,
          name: w.name,
          ref: w.ref,
          quorums: quorums.map((q) => ({
            __typename: 'Quorum',
            createProposal: null,
            removeProposal: null,
            approvers: q.approvers.map((approver) => ({
              __typename: 'Approver',
              userId: approver,
            })),
          })),
          createProposal: null,
          removeProposal: null,
        },
      },
      update: (cache, res) => {
        const wallet = res.data?.upsertWallet;
        if (!wallet) return;

        // Wallet; upsert quorums
        cache.writeQuery<WalletQuery, WalletQueryVariables>({
          query: API_QUERY_WALLET,
          variables: {
            wallet: { accountId: wallet.accountId, ref: wallet.ref },
          },
          overwrite: true,
          data: { wallet },
        });
      },
    });
  };

  return upsert;
};
