import { Token } from './token';
import { PROVIDER } from '~/util/network/provider';
import { atomFamily, useRecoilValue, useSetRecoilState } from 'recoil';
import { Address } from 'lib';
import { captureException } from '~/util/sentry/sentry';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { persistAtom } from '~/util/effect/persistAtom';
import { useCallback } from 'react';
import { AccountIdlike, asAccountId } from '@api/account';

type BalanceKey = [address: Address | null, token: Address];

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

export const tokenBalanceAtom = atomFamily<bigint, BalanceKey>({
  key: 'TokenBalance',
  default: (key) => fetch(key),
  effects: (key) =>
    key[0] !== null
      ? [
          persistAtom(),
          refreshAtom({
            refresh: () => fetch(key),
            interval: 10 * 1000,
          }),
        ]
      : [],
});

export const useTokenBalance = (token: Token, account: AccountIdlike | undefined) =>
  useRecoilValue(tokenBalanceAtom([asAccountId(account) ?? null, token.addr]));

export const useUpdateTokenBalance = (token: Token, account: AccountIdlike | undefined) => {
  const update = useSetRecoilState(tokenBalanceAtom([asAccountId(account) ?? null, token.addr]));

  return useCallback(
    async () => update(await fetch([asAccountId(account) ?? null, token.addr])),
    [account, token.addr, update],
  );
};
