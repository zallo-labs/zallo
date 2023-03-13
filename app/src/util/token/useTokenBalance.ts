import { Token } from './token';
import { PROVIDER } from '~/util/network/provider';
import { atomFamily, selectorFamily, useRecoilValue, useSetRecoilState } from 'recoil';
import { Address } from 'lib';
import { captureException } from '~/util/sentry/sentry';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { persistAtom } from '~/util/effect/persistAtom';
import { useCallback } from 'react';
import { TOKENS } from './useTokens';
import { AccountIdlike, asAccountId } from '@api/account';

type BalanceKey = [addr: Address | null, token: Address];

const fetch = async ([addr, token]: BalanceKey) => {
  if (!addr) return 0n;
  try {
    return (await PROVIDER.getBalance(addr, undefined, token)).toBigInt();
  } catch (e) {
    captureException(e, {
      level: 'error',
      extra: { token, addr },
    });
    return 0n;
  }
};

export const TOKEN_BALANCE = atomFamily<bigint, BalanceKey>({
  key: 'tokenBalance',
  default: (key) => fetch(key),
  effects: (key) => [
    persistAtom({
      save: (v) => v.toString(),
      load: BigInt,
    }),
    refreshAtom({
      fetch: () => fetch(key),
      interval: 10 * 1000,
    }),
  ],
});

export const useTokenBalance = (token: Token, account?: AccountIdlike) =>
  useRecoilValue(TOKEN_BALANCE([asAccountId(account) ?? null, token.addr]));

export const useUpdateTokenBalance = (token: Token, account?: AccountIdlike) => {
  const update = useSetRecoilState(TOKEN_BALANCE([asAccountId(account) ?? null, token.addr]));

  return useCallback(
    async () => update(await fetch([asAccountId(account) ?? null, token.addr])),
    [account, token.addr, update],
  );
};

export interface TokenWithBalance {
  token: Token;
  balance: bigint;
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

export const useTokenBalances = (account: AccountIdlike | undefined) =>
  useRecoilValue(TOKEN_BALANCES(asAccountId(account) ?? null));
