import { BigNumber } from 'ethers';
import { Token } from './token';
import { PROVIDER } from '~/util/network/provider';
import {
  atomFamily,
  selectorFamily,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { Address, ZERO } from 'lib';
import { captureException } from '~/util/sentry/sentry';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { persistAtom } from '~/util/effect/persistAtom';
import { WalletId } from '~/queries/wallets';
import { useCallback } from 'react';
import { TOKENS } from './useTokens';

// [addr, token]
type BalanceKey = [Address | null, Address];

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

type Target = Address | WalletId;

const targetAddress = (target?: Target): BalanceKey[0] =>
  typeof target === 'object' ? target.accountAddr : target || null;

export const useTokenBalance = (token: Token, account?: Address | WalletId) =>
  useRecoilValue(TOKEN_BALANCE([targetAddress(account), token.addr]));

export const useUpdateTokenBalance = (
  token: Token,
  account?: Address | WalletId,
) => {
  const update = useSetRecoilState(
    TOKEN_BALANCE([targetAddress(account), token.addr]),
  );

  return useCallback(
    async () => update(await fetch([targetAddress(account), token.addr])),
    [account, token.addr, update],
  );
};

export interface TokenWithBalance {
  token: Token;
  balance: BigNumber;
}

export const TOKEN_BALANCES = selectorFamily<
  TokenWithBalance[],
  Address | null
>({
  key: 'tokenBalances',
  get:
    (addr) =>
    ({ get }) =>
      get(TOKENS).map((token) => ({
        token,
        balance: get(TOKEN_BALANCE([addr, token.addr])),
      })),
});

export const useTokenBalances = (addr?: Address) =>
  useRecoilValue(TOKEN_BALANCES(addr ?? null));
