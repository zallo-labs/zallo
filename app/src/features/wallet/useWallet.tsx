import * as storage from 'expo-secure-store';
import * as zk from 'zksync-web3';
import { PROVIDER } from '~/provider';
import { atom, useRecoilValue } from 'recoil';
import { getSecureStore, persistAtom } from '@util/effect/persistAtom';

export const walletState = atom<zk.Wallet>({
  key: 'wallet',
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

export const useWallet = () => useRecoilValue(walletState);
