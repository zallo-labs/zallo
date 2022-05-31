import { useTokenPrice } from '@queries';
import { BigNumber, ethers } from 'ethers';
import { useMemo } from 'react';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { ETH } from './tokens';

export const useTokenValue = (token: Token, amount: BigNumber) => {
  const { price } = useTokenPrice(token);

  const fiatValue = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(
          amount.mul(price.current),
          token.decimals + FIAT_DECIMALS,
        ),
      ),
    [token, amount, price],
  );

  const ethValue = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(
          amount.mul(price.currentEth),
          token.decimals + ETH.decimals,
        ),
      ),
    [amount, price.currentEth, token.decimals],
  );

  return { fiatValue, ethValue };
};
