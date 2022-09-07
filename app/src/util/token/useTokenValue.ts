import { BigNumber, BigNumberish, ethers } from 'ethers';
import { useMemo } from 'react';
import { TokenPrice, useTokenPrice } from '~/queries/useTokenPrice.uni';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';

export interface TokenValue {
  fiatValue: number;
}

export const toTokenValue = (
  token: Token,
  amount: BigNumberish,
  price: TokenPrice,
): TokenValue => {
  const fiatValue = parseFloat(
    ethers.utils.formatUnits(
      BigNumber.from(amount).mul(price.current),
      token.decimals + FIAT_DECIMALS,
    ),
  );

  return { fiatValue };
};

export const useTokenValue = (token: Token, amount: BigNumberish) => {
  const price = useTokenPrice(token);

  return useMemo(
    () => toTokenValue(token, amount, price),
    [token, amount, price],
  );
};

export const useTokenFiatValue = (token: Token, amount: BigNumberish) =>
  useTokenValue(token, amount).fiatValue;
