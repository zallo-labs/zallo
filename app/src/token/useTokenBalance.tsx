import { BigNumber } from 'ethers';
import { Token } from './token';
import { PROVIDER } from '~/provider';
import { atomFamily, selectorFamily, useRecoilValue } from 'recoil';
import { Address, isPresent } from 'lib';
import { captureException, Severity } from '@util/sentry/sentry';
import { allTokensSelector } from './useToken';
import { refreshAtom } from '@util/effect/refreshAtom';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';

// [addr, token]
type BalanceKey = [Address, Address];

const fetch = async ([addr, token]: BalanceKey) => {
  try {
    return PROVIDER.getBalance(addr, undefined, token);
  } catch (e) {
    captureException(e, {
      level: Severity.Error,
      extra: { token, addr },
    });
    return BigNumber.from(0);
  }
};

export const tokenBalanceState = atomFamily<BigNumber, BalanceKey>({
  key: 'tokenBalance',
  default: (key) => fetch(key),
  effects: (key) => [
    refreshAtom({
      fetch: () => fetch(key),
      interval: 10 * 1000,
    }),
  ],
});

export const useTokenBalance = (token: Token) => {
  const { safeAddr } = useSelectedAccount();

  return useRecoilValue(tokenBalanceState([safeAddr, token.addr]));
};

export interface TokenWithBalance extends Token {
  balance: BigNumber;
}

const tokenBalancesSelector = selectorFamily<TokenWithBalance[], Address>({
  key: 'tokenBalances',
  get:
    (addr) =>
    ({ get }) =>
      get(allTokensSelector)
        .filter(isPresent)
        .map((token) => ({
          ...token,
          balance: get(tokenBalanceState([addr, token.addr])),
        })),
});

export const useTokenBalances = () => {
  const { safeAddr } = useSelectedAccount();

  return useRecoilValue(tokenBalancesSelector(safeAddr));
};
