import { gql } from '@apollo/client';
import { useApiClient } from '~/gql/GqlProvider';
import { CombinedWallet } from '~/queries/wallets';
import {
  ProposableStatus,
  TxDocument,
  TxQuery,
  TxQueryVariables,
  TxsMetadataDocument,
  TxsMetadataQuery,
  TxsMetadataQueryVariables,
  useUpsertWalletMutation,
  WalletQuery,
  WalletQueryVariables,
} from '~/gql/generated.api';
import {
  API_QUERY_WALLET,
  API_WALLET_FIELDS,
} from '~/queries/wallets/useWallet.api';
import { QueryOpts } from '~/gql/update';
import produce from 'immer';
import { useAccountIds } from '~/queries/account/useAccountIds';
import { hashQuorum } from 'lib';

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
  const accounts = useAccountIds();
  const [mutation] = useUpsertWalletMutation({ client: useApiClient() });

  const upsert = (w: CombinedWallet, txHash: string) => {
    const quorums = w.quorums.filter((q) => q.state.status !== 'remove');

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
          name: w.name,
          state: {
            status: w.state.status as ProposableStatus,
            proposedModificationHash:
              w.state.proposedModification?.hash ?? null,
          },
          quorums: quorums.map((q) => ({
            __typename: 'Quorum',
            accountId: w.accountAddr,
            walletRef: w.ref,
            hash: hashQuorum(q.approvers),
            approvers: q.approvers.map((approver) => ({
              __typename: 'Approver',
              userId: approver,
            })),
            state: {
              status: q.state.status as ProposableStatus,
              modificationProposalHash:
                q.state.proposedModification?.hash ?? null,
            },
          })),
        },
      },
      update: (cache, res) => {
        const wallet = res.data?.upsertWallet;
        if (!wallet) return;

        // Wallet; upsert quorums
        cache.writeQuery<WalletQuery, WalletQueryVariables>({
          query: API_QUERY_WALLET,
          variables: {
            wallet: { accountId: w.accountAddr, ref: w.ref },
          },
          overwrite: true,
          data: { wallet },
        });

        const superceededHash = w.state.proposedModification?.hash;
        if (!superceededHash) return;
        {
          // TxsMetadata; remove superceeded
          const opts: QueryOpts<TxsMetadataQueryVariables> = {
            query: TxsMetadataDocument,
            variables: { accounts },
          };

          const data = cache.readQuery<TxsMetadataQuery>(opts);
          if (data) {
            cache.writeQuery<TxsMetadataQuery>({
              ...opts,
              overwrite: true,
              data: produce(data, (data) => {
                if (!data?.txs) return;

                data.txs = data.txs.filter(
                  (tx) =>
                    !(
                      tx.accountId === w.accountAddr &&
                      tx.hash === superceededHash
                    ),
                );
              }),
            });
          }
        }

        {
          // Tx; remove superceeded
          cache.writeQuery<TxQuery, TxQueryVariables>({
            query: TxDocument,
            variables: {
              account: w.accountAddr,
              hash: superceededHash,
            },
            data: {
              tx: null,
            },
          });
        }
      },
    });
  };

  return upsert;
};
