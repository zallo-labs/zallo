import { persistAtom } from '@util/effect/persistAtom';
import { WalletRef, Address, getWalletId } from 'lib';
import { useCallback } from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { useWalletIds } from '~/queries/wallets/useWalletIds';

type WalletKey = [Address, WalletRef];

const selectedWallet = atom<WalletKey | null>({
  key: 'selectedWallet',
  default: null,
  effects: [persistAtom()],
});

export const useSelectedWallet = () => {
  const { walletIds } = useWalletIds();
  const walletId = useRecoilValue(selectedWallet);

  return useWallet(
    walletId
      ? {
          id: getWalletId(walletId[0], walletId[1]),
          accountAddr: walletId[0],
          ref: walletId[1],
        }
      : walletIds[0],
  )!;
};

export const useSelectWallet = () => {
  const select = useSetRecoilState(selectedWallet);

  return useCallback(
    (acc: WalletId) => select([acc.accountAddr, acc.ref]),
    [select],
  );
};
