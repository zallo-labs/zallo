import { Token } from './token';
import { PROVIDER } from '~/util/network/provider';
import { RecoilState, atomFamily, useRecoilValue } from 'recoil';
import { Address, tryOrIgnoreAsync } from 'lib';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { persistAtom } from '~/util/effect/persistAtom';
import { AccountIdlike, asAccountId } from '@api/account';
import BigIntJSON from '../BigIntJSON';

type BalanceKey = [address: Address | null, token: Address];

const fetch = async ([addr, token]: BalanceKey) => {
  if (!addr) return 0n;

  return tryOrIgnoreAsync(async () =>
    (await PROVIDER.getBalance(addr, undefined, token)).toBigInt(),
  );
};

export const tokenBalanceAtom: (param: BalanceKey) => RecoilState<bigint> = atomFamily<
  bigint,
  BalanceKey
>({
  key: 'TokenBalance',
  default: async (key) => (await fetch(key)) ?? 0n,
  effects: (key) =>
    key[0] !== null
      ? [
          persistAtom({
            stringify: BigIntJSON.stringify,
            parse: BigIntJSON.parse,
          }),
          refreshAtom({
            refresh: async ({ get }) => {
              const newValue = await fetch(key);
              return newValue ?? get(tokenBalanceAtom(key)); // Use previous value if fetch fails
            },
            interval: 10 * 1000,
          }),
        ]
      : [],
});

export const useTokenBalance = (token: Token, account: AccountIdlike | undefined) =>
  useRecoilValue(tokenBalanceAtom([asAccountId(account) ?? null, token.address]));
