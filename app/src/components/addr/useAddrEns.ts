import { persistAtom } from '~/util/effect/persistAtom';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { PROVIDER } from '~/util/network/provider';
import { Address } from 'lib';
import { Duration } from 'luxon';
import { atomFamily, useRecoilValue } from 'recoil';

type EnsRes = string | null;

const fetch = async (addr: Address) => {
  try {
    return await PROVIDER.lookupAddress(addr);
  } catch (e) {
    // Network doesn't support ENS
    return null;
  }
};

const addrEnsState = atomFamily<EnsRes, Address>({
  key: 'addrEns',
  default: fetch,
  effects: (addr) => [
    persistAtom(),
    refreshAtom({
      fetch: () => fetch(addr),
      interval: Duration.fromObject({ hours: 1 }).as('milliseconds'),
    }),
  ],
});

export const useAddrEns = (addr: Address) => useRecoilValue(addrEnsState(addr));
