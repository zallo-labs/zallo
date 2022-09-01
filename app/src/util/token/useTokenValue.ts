import { BigNumber, BigNumberish, ethers } from 'ethers';
import { useMemo } from 'react';
import { TokenPrice, useTokenPrice } from '~/queries/useTokenPrice.uni';
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

export const useTokenValue = (token: Token, amount: BigNumberish) => {
  const { price } = useTokenPrice(token);

  return useMemo(
    () => getTokenValue(token, BigNumber.from(amount), price),
    [token, amount, price],
  );
};

export const useTokenFiatValue = (token: Token, amount: BigNumberish) =>
  useTokenValue(token, amount).fiatValue;
