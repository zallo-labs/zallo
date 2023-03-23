import { persistAtom } from '~/util/effect/persistAtom';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { PROVIDER } from '~/util/network/provider';
import { Address, tryOrAsync } from 'lib';
import { Duration } from 'luxon';
import { atomFamily, useRecoilValue } from 'recoil';

const fetch = async (addr: Address | null) =>
  addr ? tryOrAsync(() => PROVIDER.lookupAddress(addr), null) : null;

const addressEnsAtom = atomFamily<string | null, Address | null>({
  key: 'AddressEns',
  default: fetch,
  effects: (addr) => [
    persistAtom({
      saveIf: (addr) => addr !== null,
    }),
    refreshAtom({
      refresh: () => fetch(addr),
      interval: Duration.fromObject({ hours: 1 }).as('milliseconds'),
    }),
  ],
});

export const useAddressEns = (addr?: Address) => useRecoilValue(addressEnsAtom(addr || null));
