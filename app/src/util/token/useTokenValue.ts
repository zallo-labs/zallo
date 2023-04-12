import { formatUnits } from 'ethers/lib/utils';
import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { tokenPriceDataAtom } from '@uniswap/useTokenPrice';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { tokenAtom } from './useToken';

type TokenValueParam = [token: Address | undefined, amount: string | undefined];

export const tokenValueSelector = selectorFamily<number, TokenValueParam>({
  key: 'tokenValue',
  get:
    ([token, amount]) =>
    ({ get }) => {
      if (!token || !amount) return 0;

      const { decimals } = get(tokenAtom(token));
      const price = get(tokenPriceDataAtom(token));

      return parseFloat(formatUnits(BigInt(amount) * price.current, decimals + FIAT_DECIMALS));
    },
});

export const useTokenValue = (token: Token | undefined, amount: bigint | undefined) =>
  useRecoilValue(tokenValueSelector([token?.address, amount?.toString()]));

const tokenValuesSelector = selectorFamily<number[], TokenValueParam[]>({
  key: 'tokenValues',
  get:
    (tokens) =>
    ({ get }) =>
      tokens.map((param) => get(tokenValueSelector(param))),
});

export const useTokenValues = (...params: TokenValueParam[]) =>
  useRecoilValue(tokenValuesSelector(params));
