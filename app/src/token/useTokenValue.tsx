import { TokenPrice, useTokenPrice } from '@queries';
import { BigNumber, ethers } from 'ethers';
import { useMemo } from 'react';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { ETH } from './tokens';

export interface TokenValue {
  fiatValue: number;
  ethValue: number;
}

export const getTokenValue = (
  token: Token,
  amount: BigNumber,
  price: TokenPrice,
): TokenValue => {
  const fiatValue = parseFloat(
    ethers.utils.formatUnits(
      amount.mul(price.current),
      token.decimals + FIAT_DECIMALS,
    ),
  );

  const ethValue = parseFloat(
    ethers.utils.formatUnits(
      amount.mul(price.currentEth),
      token.decimals + ETH.decimals,
    ),
  );

  return { fiatValue, ethValue };
};

export const useTokenValue = (token: Token, amount: BigNumber) => {
  const { price } = useTokenPrice(token);

  const value = useMemo(
    () => getTokenValue(token, amount, price),
    [token, amount, price],
  );

  return value;
};
