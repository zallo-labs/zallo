import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { isTruthy } from 'lib';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { Transfer } from '~/queries/transfer/useTransfer.sub';
import { Proposal } from '~/queries/proposal';

export const useProposalTransfers = (p: Proposal): Transfer[] => {
  const transferToken = useMaybeToken(p.to);
  const transfer = useDecodedTransfer(p);

  return [
    p.value?.gt(0) &&
      ({
        token: ETH,
        from: p.account,
        to: p.to,
        amount: p.value,
        direction: 'OUT',
        timestamp: p.timestamp,
      } as const),
    transfer &&
      transferToken &&
      ({
        token: transferToken,
        from: p.account,
        to: p.to,
        amount: transfer.value,
        direction: 'OUT',
        timestamp: p.timestamp,
      } as const),
  ].filter(isTruthy);
};
