import { Call, ZERO } from 'lib';
import { useMemo } from 'react';
import { Token } from '@token/token';
import { ETH } from '@token/tokens';
import { useTokenValue } from '@token/useTokenValue';
import { useDecodedTransfer } from './useDecodedTransfer';

export const useCallValues = (call: Call, token: Token) => {
  const transferAmount = useDecodedTransfer(call.to, call.data)?.value ?? ZERO;
  const ethValue = useTokenValue(ETH, call.value);
  const transferValue = useTokenValue(token, transferAmount);

  return useMemo(
    () => ({
      ethValue,
      transferValue,
      totalFiat: ethValue.fiatValue + transferValue.fiatValue,
    }),
    [ethValue, transferValue],
  );
};
