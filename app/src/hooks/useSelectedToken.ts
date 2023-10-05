import { useAtomValue, useSetAtom } from 'jotai';
import { Address } from 'lib';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { persistedAtom } from '~/lib/persistedAtom';

const atom = persistedAtom('selectedToken', ETH_ADDRESS as Address);

export const useSelectedToken = () => useAtomValue(atom);

export const useSetSelectedToken = () => useSetAtom(atom);
