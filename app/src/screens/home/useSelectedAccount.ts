import { persistAtom } from '~/util/effect/persistAtom';
import { Address } from 'lib';
import { useCallback, useEffect } from 'react';
import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import { useAccountIds } from '~/queries/account/useAccountIds.api';

const SELECTED_ACCOUNT = atom<Address | null>({
  key: 'selectedAccount',
  default: null,
  effects: [persistAtom()],
});

export const useSelectedAccount = () => {
  const accountIds = useAccountIds();
  const [selected, select] = useRecoilState(SELECTED_ACCOUNT);

  useEffect(() => {
    // Deselect account if it's not in the list of accounts
    if (selected && !accountIds.includes(selected)) select(null);
  }, [accountIds, select, selected]);

  return selected ?? accountIds[0];
};

export const useSelectAccount = () => {
  const select = useSetRecoilState(SELECTED_ACCOUNT);
  return useCallback((account: Address) => select(account), [select]);
};

// export const useSelectedUser = () => useDeviceUser(useSelectedAccount());

// export const useSelectUser = () => {
//   const select = useSelectAccount();
//   return useCallback((user: UserId) => select(user.account), [select]);
// };
