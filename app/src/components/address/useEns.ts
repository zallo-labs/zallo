import { persistAtom } from '~/util/effect/persistAtom';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { PROVIDER } from '~/util/network/provider';
import { Address, tryOrAsync } from 'lib';
import { Duration } from 'luxon';
import { atomFamily, useRecoilValue } from 'recoil';

const fetch = async (address: Address | null) =>
  address ? tryOrAsync(() => PROVIDER.lookupAddress(address), null) : null;

const addressEnsAtom = atomFamily<string | null, Address | null>({
  key: 'Ens',
  default: fetch,
  effects: (address) => [
    persistAtom(),
    refreshAtom({
      refresh: () => fetch(address),
      interval: Duration.fromObject({ hours: 1 }).as('milliseconds'),
    }),
  ],
});

export const useEns = (addr?: Address) => useRecoilValue(addressEnsAtom(addr || null));
