import { formatUnits } from 'ethers/lib/utils';
import { Address, BigIntlike } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { tokenPriceDataAtom } from '@uniswap/useTokenPrice';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { tokenAtom } from './useToken';

type TokenValueParam = [token: Address | undefined, amount: string | undefined];

export const tokenValueSelector = selectorFamily<number, TokenValueParam>({
  key: 'tokenValue',
  get:
    ([token, amountParam]) =>
    ({ get }) => {
      const amount = BigInt(amountParam || 0n);
      if (!token || amount === 0n) return 0;

      const { decimals } = get(tokenAtom(token));
      const price = get(tokenPriceDataAtom(token));

      return parseFloat(formatUnits(amount * price.current, decimals + FIAT_DECIMALS));
    },
});

export const useTokenValue = (token: Token | undefined, amount: BigIntlike | undefined) =>
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
