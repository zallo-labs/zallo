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

export const useTxTransfers = (tx: Proposal): TxTransfer[] => {
  const transferToken = useMaybeToken(tx.to) ?? ETH;
  const transferAmount = useDecodedTransfer(tx)?.value ?? ZERO;
  const transferFiat = useTokenValue(transferToken, transferAmount);
  const transferAvailable = useTokenAvailable(transferToken, tx.wallet);

  const txEth: TxTransfer = {
    token: ETH,
    amount: tx.value,
    fiatAmount: useTokenValue(ETH, tx.value),
    available: useTokenAvailable(ETH, tx.wallet),
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
