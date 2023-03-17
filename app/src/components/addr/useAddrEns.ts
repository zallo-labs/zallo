import { persistAtom } from '~/util/effect/persistAtom';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { PROVIDER } from '~/util/network/provider';
import { Address, tryOrAsync } from 'lib';
import { Duration } from 'luxon';
import { atomFamily, useRecoilValue } from 'recoil';

const fetch = async (addr: Address | null) =>
  addr ? tryOrAsync(() => PROVIDER.lookupAddress(addr), null) : null;

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
