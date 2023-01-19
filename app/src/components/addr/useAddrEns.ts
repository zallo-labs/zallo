import { persistAtom } from '~/util/effect/persistAtom';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { PROVIDER } from '~/util/network/provider';
import { Address } from 'lib';
import { Duration } from 'luxon';
import { atomFamily, useRecoilValue } from 'recoil';

const fetch = async (addr: Address | null) => {
  try {
    return addr ? await PROVIDER.lookupAddress(addr) : null;
  } catch (e) {
    // Network doesn't support ENS
    return null;
  }
};

const addrEnsState = atomFamily<string | null, Address | null>({
  key: 'addrEns',
  default: fetch,
  effects: (addr) => [
    persistAtom({
      saveIf: (addr) => addr !== null,
    }),
    refreshAtom({
      fetch: () => fetch(addr),
      interval: Duration.fromObject({ hours: 1 }).as('milliseconds'),
    }),
  ],
});

export const useAddrEns = (addr?: Address) => useRecoilValue(addrEnsState(addr || null));
