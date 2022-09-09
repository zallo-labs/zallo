import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import assert from 'assert';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { TransferType } from '~/gql/generated.sub';
import { Transfer } from '~/queries/transfer/useTransfer.sub';
import { Tx } from '~/queries/tx';

export const useTxTransfers = (tx?: Tx): Transfer[] => {
  const transferToken = useMaybeToken(tx?.to);
  const transfer = useDecodedTransfer(tx);

  if (!tx) return [];

  const ethTransfer: Transfer = {
    direction: TransferType.In,
    token: ETH,
    from: tx.account,
    to: tx.to,
    amount: tx.value,
  };

  if (!transfer) return [ethTransfer];

  assert(transferToken, 'transfer token not found');

  return [
    ethTransfer,
    {
      direction: TransferType.In,
      token: transferToken,
      from: tx.account,
      to: tx.to,
      amount: transfer.value,
    },
  ];
};
