import { useAtomValue, useSetAtom } from 'jotai';

import { Chain } from 'chains';
import { asChain, isAddress, UAddress } from 'lib';
import { persistedAtom } from '~/lib/persistedAtom';

const addressAtom = persistedAtom<UAddress | null>('selectedAccount', null, {
  migrate: (v) => {
    if (isAddress(v)) return null;
  },
});

export function useSelectedAccount() {
  return useAtomValue(addressAtom);
}

export function useSetSelectedAccont() {
  return useSetAtom(addressAtom);
}

export function useSelectedChain(): Chain {
  const account = useSelectedAccount();
  return account ? asChain(account) : 'zksync';
}
