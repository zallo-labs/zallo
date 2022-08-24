import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import {
  TxQuery,
  TxQueryVariables,
  useProposeTxMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { createTx, getTxId, hashTx, signTx, TxDef } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { API_QUERY_TX, API_TX_FIELDS } from '~/queries/tx/tx/useTx.api';
import { WalletId } from '~/queries/wallets';

gql`
  ${API_TX_FIELDS}

  mutation ProposeTx(
    $account: Address!
    $walletRef: Bytes4!
    $tx: TxInput!
    $signature: Bytes!
  ) {
    proposeTx(
      account: $account
      walletRef: $walletRef
      tx: $tx
      signature: $signature
    ) {
      ...TxFields
    }
  }
`;

export const useApiProposeTx = () => {
  const device = useDevice();
  const [mutation] = useProposeTxMutation({ client: useApiClient() });

  const propose = useCallback(
    async (txDef: TxDef, wallet: WalletId) => {
      const tx = createTx(txDef);
      const hash = await hashTx(wallet.accountAddr, tx);
      const signature = await signTx(device, wallet.accountAddr, tx);
      const createdAt = DateTime.now().toISO();

      return await mutation({
        variables: {
          account: wallet.accountAddr,
          walletRef: wallet.ref,
          tx: {
            to: tx.to,
            value: tx.value.toString(),
            data: hexlify(tx.data),
            salt: hexlify(tx.salt),
          },
          signature,
        },
        update: (cache, res) => {
          const proposedTx = res?.data?.proposeTx;
          if (!proposedTx) return;

          // Tx; create
          cache.writeQuery<TxQuery, TxQueryVariables>({
            query: API_QUERY_TX,
            variables: { account: proposedTx.accountId, hash: proposedTx.hash },
            data: {
              tx: proposedTx,
            },
          });
        },
        optimisticResponse: {
          proposeTx: {
            __typename: 'Tx',
            id: getTxId(wallet.accountAddr, hash),
            accountId: wallet.accountAddr,
            hash,
            to: tx.to,
            value: tx.value.toString(),
            data: hexlify(tx.data),
            salt: hexlify(tx.salt),
            walletRef: wallet.ref,
            approvals: [
              {
                __typename: 'Approval',
                userId: device.address,
                signature,
                createdAt,
              },
            ],
            createdAt,
            submissions: [],
          },
        },
      });
    },
    [device, mutation],
  );

  return propose;
};
