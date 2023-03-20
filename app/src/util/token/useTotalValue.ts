import { Address } from 'lib';
import { selectorFamily, useRecoilValue } from 'recoil';
import { tokenAddressesAtom } from './useToken';
import { tokenBalanceAtom } from './useTokenBalance';
import { tokenValueSelector } from './useTokenValue';

const totalValueSelector = selectorFamily<number, Address | null>({
  key: 'TotalValue',
  get:
    (addr) =>
    ({ get }) => {
      if (!addr) return 0;

      return get(tokenAddressesAtom).reduce(
        (sum, token) =>
          sum + get(tokenValueSelector([token, get(tokenBalanceAtom([addr, token])).toString()])),
        0,
      );
    },
});

export const useTotalValue = (address: Address | undefined) =>
  useRecoilValue(totalValueSelector(address ?? null));
