import * as storage from 'expo-secure-store';
import { PROVIDER } from '~/util/network/provider';
import { atom, useRecoilValue } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import { Device } from 'lib';

export const deviceWallet = atom<Device>({
  key: 'device',
  default: Device.createRandom().connect(PROVIDER),
  effects: [
    persistAtom({
      save: (wallet) => wallet.privateKey,
      load: (privateKey) => new Device(privateKey, PROVIDER),
      storage: getSecureStore({
        keychainAccessible: storage.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    }),
  ],
  dangerouslyAllowMutability: true, // Required due to provider internal mutations
});

export const useDevice = () => useRecoilValue(deviceWallet);
