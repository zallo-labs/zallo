import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { isTruthy } from 'lib';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { Transfer } from '@subgraph/transfer';
import { Proposal } from '@api/proposal';

export const useProposalTransfers = (p: Proposal): Transfer[] => {
  const transferToken = useMaybeToken(p.to);
  const transfer = useDecodedTransfer(p);

  return [
    p.value !== undefined &&
      p.value > 0 &&
      ({
        token: ETH,
        from: p.account,
        to: p.to,
        amount: p.value,
        direction: 'OUT',
        timestamp: p.createdAt,
      } as const),
    transfer &&
      transferToken &&
      ({
        token: transferToken,
        from: p.account,
        to: p.to,
        amount: transfer.value,
        direction: 'OUT',
        timestamp: p.createdAt,
      } as const),
  ].filter(isTruthy);
};
