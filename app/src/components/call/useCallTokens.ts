import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { useMaybeToken } from '@token/useToken';
import { useTokenFiatValue } from '@token/useTokenValue';
import { BigNumber } from 'ethers';
import { Call, ZERO } from 'lib';
import { useDecodedTransfer } from '~/components/call/useDecodedTransfer';
import { Tx } from '~/queries/tx';

export interface CallToken {
  token: Token;
  amount: BigNumber;
  fiat: number;
}

export const useCallTokens = (call: Call | Tx): CallToken[] => {
  const ethFiat = useTokenFiatValue(ETH, call.value);

  const transferToken = useMaybeToken(call.to) ?? ETH;
  const transferAmount = useDecodedTransfer(call)?.value ?? ZERO;
  const transferFiat = useTokenFiatValue(transferToken, transferAmount);

  const txEth: CallToken = {
    token: ETH,
    amount: call.value,
    fiat: ethFiat,
  };

  if (transferToken === ETH) {
    return [txEth];
  } else {
    return [
      txEth,
      {
        token: transferToken,
        amount: transferAmount,
        fiat: transferFiat,
      },
    ];
  }
};
