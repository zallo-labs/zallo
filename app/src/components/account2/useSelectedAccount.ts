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
  const [fallback] = useAccountIds();

  return useRecoilValue(selectedAtom) ?? fallback;
};

export const useSelectedAccount = () => useAccount(useSelectedAccountId());

export const useSetSelectedAccount = () => useSetRecoilState(selectedAtom);
