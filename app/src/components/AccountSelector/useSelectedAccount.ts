import { useAccountIds } from '@api/account';
import { Address } from 'lib';
import { persistedAtom } from '~/util/persistedAtom';
import { useAtomValue, useSetAtom } from 'jotai';

const selectedAccountAtom = persistedAtom<Address | null>('SelectedAccount', null);

export const useSelectedAccount = () => {
  const accounts = useAccountIds();
  return useAtomValue(selectedAccountAtom) ?? accounts[0]!;
};

export const useSetSelectedAccount = () => useSetAtom(selectedAccountAtom);
