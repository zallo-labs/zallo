import { persistAtom } from '@util/effect/persistAtom';
import { AccountRef, Address } from 'lib';
import { useCallback, useMemo } from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { CombinedAccount } from '~/queries/accounts';
import { useAccounts } from '~/queries/accounts/useAccounts';
import { useSafe } from '~/queries/safe/useSafe';

type AccountKey = [Address, AccountRef];

const selectedAccount = atom<AccountKey | null>({
  key: 'selectedAccount',
  default: null,
  effects: [persistAtom()],
});

export const useSelectedAccount = () => {
  const { accounts } = useAccounts();
  const key = useRecoilValue(selectedAccount);
  const { safe } = useSafe(key?.[0] ?? accounts[0].safeAddr);

  return useMemo(() => {
    const account =
      (key &&
        accounts.find((a) => a.safeAddr === key[0] && a.ref === key[1])) ||
      accounts[0];

    return {
      ...account,
      safe,
    };
  }, [accounts, key, safe]);
};

export const useSelectAccount = () => {
  const select = useSetRecoilState(selectedAccount);

  return useCallback(
    (acc: CombinedAccount) => select([acc.safeAddr, acc.ref]),
    [select],
  );
};
