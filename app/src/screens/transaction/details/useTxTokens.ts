import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useTokenAvailable } from '@token/useTokenAvailable';
import { useTokenFiatValue } from '@token/useTokenValue';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { Tx } from '~/queries/tx';

export interface TxToken {
  token: Token;
  amount: BigNumber;
  fiatAmount: number;
  available: BigNumber;
}

export const useTxTokens = (tx: Tx): TxToken[] => {
  const transferToken = useMaybeToken(tx.to) ?? ETH;
  const transferAmount = useDecodedTransfer(tx)?.value ?? ZERO;
  const transferFiat = useTokenFiatValue(transferToken, transferAmount);
  const transferAvailable = useTokenAvailable(transferToken, tx.wallet);

  const txEth: TxToken = {
    token: ETH,
    amount: tx.value,
    fiatAmount: useTokenFiatValue(ETH, tx.value),
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
