import { formatUnits } from 'ethers/lib/utils';
import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_PRICE } from '@uniswap/useTokenPrice';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { TOKEN } from './useToken';

export interface TokenValue {
  fiatValue: number;
}

type TokenValueParam = [Address, string];

export const TOKEN_VALUE = selectorFamily<number, TokenValueParam>({
  key: 'tokenValue',
  get:
    ([tokenAddr, amount]) =>
    ({ get }) => {
      const token = get(TOKEN(tokenAddr));
      const price = get(TOKEN_PRICE(tokenAddr));

      return parseFloat(
        formatUnits(BigInt(amount) * price.current, token.decimals + FIAT_DECIMALS),
      );
    },
});

export const useTokenValue = (token: Token, amount = 0n) =>
  useRecoilValue(TOKEN_VALUE([token.addr, amount.toString()]));

const TOKEN_VALUES = selectorFamily<number[], TokenValueParam[]>({
  key: 'tokenValues',
  get:
    (tokens) =>
    ({ get }) =>
      tokens.map((param) => get(TOKEN_VALUE(param))),
});

export const useTokenValues = (...params: TokenValueParam[]) =>
  useRecoilValue(TOKEN_VALUES(params));
