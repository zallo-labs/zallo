import { useEffect } from 'react';
import { AccountId, useAccount, useAccountIds } from '@api/account';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from '~/util/effect/persistAtom';
import { setContext } from '~/util/analytics';

const selectedAtom = atom<AccountId | null>({
  key: 'SelectedAccount',
  default: null,
  effects: [
    persistAtom({
      saveIf: (v) => v !== null,
    }),
  ],
});

export const useSelectedAccountId = () => {
  const accountIds = useAccountIds();
  const id = useRecoilValue(selectedAtom) ?? accountIds[0]!;

  useEffect(() => {
    setContext('account', id);
  }, [id]);

  return id;
};

export const useSelectedAccount = () => useAccount(useSelectedAccountId());

export const useSetSelectedAccount = () => useSetRecoilState(selectedAtom);
