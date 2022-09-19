import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenValue } from '@token/useTokenValue';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { Proposal } from '~/queries/proposal';

export interface TxTransfer {
  token: Token;
  amount: BigNumber;
  fiatAmount: number;
  available: BigNumber;
}

export const useTxTransfers = (p: Proposal): TxTransfer[] => {
  const transferToken = useMaybeToken(p.to) ?? ETH;
  const transferAmount = useDecodedTransfer(p)?.value ?? ZERO;
  const transferFiat = useTokenValue(transferToken, transferAmount);
  const transferAvailable = useTokenAvailable(transferToken, p.proposer);

  const txEth: TxTransfer = {
    token: ETH,
    amount: p.value,
    fiatAmount: useTokenValue(ETH, p.value),
    available: useTokenAvailable(ETH, p.proposer),
  };

  if (transferToken === ETH) {
    return [txEth];
  } else {
    return [
      txEth,
      {
        token: transferToken,
        amount: transferAmount,
        fiatAmount: transferFiat,
        available: transferAvailable,
      },
    ];
  }
};
