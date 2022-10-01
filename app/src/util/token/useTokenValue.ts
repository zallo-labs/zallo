import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { Address, ZERO } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { TOKEN_PRICE } from '~/queries/useTokenPrice.uni';
import { FIAT_DECIMALS } from './fiat';
import { Token } from './token';
import { TOKEN } from './useToken';

export interface TokenValue {
  fiatValue: number;
}

type TokenValueParam = [Address, BigNumber];

export const TOKEN_VALUE = selectorFamily<number, TokenValueParam>({
  key: 'tokenValue',
  get:
    ([tokenAddr, amount]) =>
    ({ get }) => {
      const token = get(TOKEN(tokenAddr));
      const price = get(TOKEN_PRICE(tokenAddr));

      return parseFloat(
        formatUnits(
          BigNumber.from(amount).mul(price.current),
          token.decimals + FIAT_DECIMALS,
        ),
      );
    },
});

export const useTokenValue = (token: Token, amount?: BigNumberish) =>
  useRecoilValue(TOKEN_VALUE([token.addr, BigNumber.from(amount ?? ZERO)]));

const TOKEN_VALUES = selectorFamily<number[], TokenValueParam[]>({
  key: 'tokenValues',
  get:
    (tokens) =>
    ({ get }) =>
      tokens.map((param) => get(TOKEN_VALUE(param))),
});

export const useTokenValues = (...params: TokenValueParam[]) =>
  useRecoilValue(TOKEN_VALUES(params));
