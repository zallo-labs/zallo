import { useAtomValue, useSetAtom } from 'jotai';
import { Address } from 'lib';
import { persistedAtom } from '~/lib/persistedAtom';

const addressAtom = persistedAtom<Address | null>('selectedAccount', null);

export function useSelectedAccount() {
  return useAtomValue(addressAtom);
}

export function useSetSelectedAccont() {
  return useSetAtom(addressAtom);
}
