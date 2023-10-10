import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Address } from 'lib';

const addressAtom = atom<Address | undefined>(undefined);

export function useSelectedAccount() {
  return useAtomValue(addressAtom);
}

export function useSetSelectedAccont() {
  return useSetAtom(addressAtom);
}
