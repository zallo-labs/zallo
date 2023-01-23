import * as storage from 'expo-secure-store';
import { PROVIDER } from '~/util/network/provider';
import { atom, useRecoilValue } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import * as zk from 'zksync-web3';

export const CREDENTIALS = atom<zk.Wallet>({
  key: 'credentials',
  default: zk.Wallet.createRandom().connect(PROVIDER),
  effects: [
    persistAtom({
      save: (wallet) => wallet.privateKey,
      load: (privateKey) => new zk.Wallet(privateKey, PROVIDER),
      storage: getSecureStore({
        keychainAccessible: storage.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    }),
  ],
  dangerouslyAllowMutability: true, // Required due to provider internal mutations
});

export const useCredentials = () => useRecoilValue(CREDENTIALS);
