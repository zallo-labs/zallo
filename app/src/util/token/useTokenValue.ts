import { formatUnits } from 'ethers/lib/utils';
import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { tokenPriceAtom } from '@uniswap/useTokenPrice';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { tokenAtom } from './useToken';

type TokenValueParam = [token: Address, amount: string];

export const tokenValueSelector = selectorFamily<number, TokenValueParam>({
  key: 'tokenValue',
  get:
    ([tokenAddr, amount]) =>
    ({ get }) => {
      const token = get(tokenAtom(tokenAddr));
      const price = get(tokenPriceAtom(tokenAddr));

      return parseFloat(
        formatUnits(BigInt(amount) * price.current, token.decimals + FIAT_DECIMALS),
      );
    },
});

export const useTokenValue = (token: Token, amount = 0n) =>
  useRecoilValue(tokenValueSelector([token.addr, amount.toString()]));

const tokenValuesSelector = selectorFamily<number[], TokenValueParam[]>({
  key: 'tokenValues',
  get:
    (tokens) =>
    ({ get }) =>
      tokens.map((param) => get(tokenValueSelector(param))),
});

export const useTokenValues = (...params: TokenValueParam[]) =>
  useRecoilValue(tokenValuesSelector(params));
