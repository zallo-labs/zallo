import { BigNumber } from 'ethers';
import { useSafe } from '@features/safe/SafeProvider';
import { Token } from './token';
import { PROVIDER } from '~/provider';
import { atomFamily, selectorFamily, useRecoilValue } from 'recoil';
import { Address } from 'lib';
import { persistAtom } from '@util/persistAtom';
import { captureException, Severity } from '@util/sentry/sentry';
import { allTokensSelector } from './useToken';

type BalanceKey = {
  addr: Address;
  token: Address;
};

export const tokenBalanceState = atomFamily<BigNumber, BalanceKey>({
  key: 'tokenBalance',
  default: ({ addr, token }) => {
    try {
      return PROVIDER.getBalance(addr, undefined, token);
    } catch (e) {
      captureException(e, {
        level: Severity.Error,
        extra: { token, addr },
      });
      return BigNumber.from(0);
    }
  },
  // effects: [persistAtom()],
});

export const useTokenBalance = (token: Token) => {
  const { safe } = useSafe();

  return useRecoilValue(
    tokenBalanceState({ addr: safe.address, token: token.addr }),
  );
};

export interface TokenWithBalance extends Token {
  balance: BigNumber;
}

const tokenBalancesSelector = selectorFamily<TokenWithBalance[], Address>({
  key: 'tokenBalances',
  get:
    (addr) =>
    ({ get }) => {
      const tokens = get(allTokensSelector);
      return tokens.map((token) => ({
        ...token,
        balance: get(tokenBalanceState({ addr, token: token.addr })),
      }));
    },
});

export const useTokenBalances = () => {
  const { safe } = useSafe();

  return useRecoilValue(tokenBalancesSelector(safe.address));
};
