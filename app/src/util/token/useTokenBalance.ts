import { BigNumber } from 'ethers';
import { Token } from './token';
import { PROVIDER } from '~/util/network/provider';
import { atomFamily, selectorFamily, useRecoilValue, useSetRecoilState } from 'recoil';
import { Address, ZERO } from 'lib';
import { captureException } from '~/util/sentry/sentry';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { persistAtom } from '~/util/effect/persistAtom';
import { useCallback } from 'react';
import { TOKENS } from './useTokens';
import { Accountlike, getAccountlikeAddr } from '~/queries/account/useAccount.api';

type BalanceKey = [addr: Address | null, token: Address];

const fetch = async ([addr, token]: BalanceKey) => {
  if (!addr) return ZERO;
  try {
    return PROVIDER.getBalance(addr, undefined, token);
  } catch (e) {
    captureException(e, {
      level: 'error',
      extra: { token, addr },
    });
    return BigNumber.from(0);
  }
};

export const TOKEN_BALANCE = atomFamily<BigNumber, BalanceKey>({
  key: 'tokenBalance',
  default: (key) => fetch(key),
  effects: (key) => [
    persistAtom({
      save: (v) => v.toString(),
      load: BigNumber.from,
      version: 1,
    }),
    refreshAtom({
      fetch: () => fetch(key),
      interval: 10 * 1000,
    }),
  ],
});

export const useTokenBalance = (token: Token, account?: Accountlike) =>
  useRecoilValue(TOKEN_BALANCE([getAccountlikeAddr(account), token.addr]));

export const useUpdateTokenBalance = (token: Token, account?: Accountlike) => {
  const update = useSetRecoilState(TOKEN_BALANCE([getAccountlikeAddr(account), token.addr]));

  return useCallback(
    async () => update(await fetch([getAccountlikeAddr(account), token.addr])),
    [account, token.addr, update],
  );
};

export interface TokenWithBalance {
  token: Token;
  balance: BigNumber;
}

export const TOKEN_BALANCES = selectorFamily<TokenWithBalance[], Address | null>({
  key: 'tokenBalances',
  get:
    (addr) =>
    ({ get }) =>
      get(TOKENS).map((token) => ({
        token,
        balance: get(TOKEN_BALANCE([addr, token.addr])),
      })),
});

export const useTokenBalances = (account: Accountlike | undefined) =>
  useRecoilValue(TOKEN_BALANCES(getAccountlikeAddr(account)));
