import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { isTruthy } from 'lib';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { TransferType } from '~/gql/generated.sub';
import { Transfer } from '~/queries/transfer/useTransfer.sub';
import { Proposal } from '~/queries/proposal';

export const useTxTransfers = (tx?: Proposal): Transfer[] => {
  const transferToken = useMaybeToken(tx?.to);
  const transfer = useDecodedTransfer(tx);

  if (!tx) return [];

  return [
    tx.value.gt(0) && {
      token: ETH,
      from: tx.account,
      to: tx.to,
      amount: tx.value,
      direction: TransferType.Out,
    },
    transfer &&
      transferToken && {
        token: transferToken,
        from: tx.account,
        to: tx.to,
        amount: transfer.value,
        direction: TransferType.Out,
      },
  ].filter(isTruthy);
};
