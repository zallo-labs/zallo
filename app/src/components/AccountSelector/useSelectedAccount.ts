import { useEffect } from 'react';
import { useAccount, useAccountIds } from '@api/account';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from '~/util/effect/persistAtom';
import { setContext } from '~/util/analytics';
import { Address } from 'lib';

const selectedAtom = atom<Address | null>({
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
