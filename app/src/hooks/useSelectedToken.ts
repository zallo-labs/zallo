import { Chain } from 'chains';
import { useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { asUAddress } from 'lib';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { persistedAtom } from '~/lib/persistedAtom';

const lastUsedFamily = atomFamily((chain: Chain) =>
  persistedAtom(`${chain}:selectedToken`, asUAddress(ETH_ADDRESS, chain)),
);

export const useSelectedToken = (chain: Chain) => useAtomValue(lastUsedFamily(chain));

export const useSetSelectedToken = (chain: Chain) => useSetAtom(lastUsedFamily(chain));
