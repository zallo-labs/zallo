import { AccountId, useAccount, useAccountIds } from '@api/account';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from '~/util/effect/persistAtom';

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

  return useRecoilValue(selectedAtom) ?? accountIds[0]!;
};

export const useSelectedAccount = () => useAccount(useSelectedAccountId());

export const useSetSelectedAccount = () => useSetRecoilState(selectedAtom);
