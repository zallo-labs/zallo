import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { tokensSelector } from './useToken';
import { tokenBalanceAtom } from './useTokenBalance';
import { tokenValueSelector } from './useTokenValue';

const totalValueSelector = selectorFamily<number, Address | null>({
  key: 'TotalValue',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return 0;

      return get(tokensSelector).reduce(
        (sum, token) =>
          sum +
          get(
            tokenValueSelector([token.addr, get(tokenBalanceAtom([addr, token.addr])).toString()]),
          ),
        0,
      );
    },
});

export const useTotalValue = (address: Address | undefined) =>
  useRecoilValue(totalValueSelector(address ?? null));
