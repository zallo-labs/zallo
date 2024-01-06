import { useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

import { Chain } from 'chains';
import { asUAddress, ETH_ADDRESS } from 'lib';
import { persistedAtom } from '~/lib/persistedAtom';

const lastUsedFamily = atomFamily((chain: Chain) =>
  persistedAtom(`${chain}:selectedToken`, asUAddress(ETH_ADDRESS, chain)),
);

export const useSelectedToken = (chain: Chain) => useAtomValue(lastUsedFamily(chain));

export const useSetSelectedToken = (chain: Chain) => useSetAtom(lastUsedFamily(chain));
