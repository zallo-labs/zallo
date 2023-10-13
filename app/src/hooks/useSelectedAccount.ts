import { useAtomValue, useSetAtom } from 'jotai';
import { Address } from 'lib';
import { persistedAtom } from '~/lib/persistedAtom';

const addressAtom = persistedAtom<Address | undefined>('selectedAccount', undefined, {
  skipInitialPersist: true,
});

export function useSelectedAccount() {
  return useAtomValue(addressAtom);
}

export function useSetSelectedAccont() {
  return useSetAtom(addressAtom);
}
