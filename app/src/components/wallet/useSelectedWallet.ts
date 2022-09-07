import { persistAtom } from '~/util/effect/persistAtom';
import { WalletRef, Address, getWalletId } from 'lib';
import { useCallback } from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import { useWalletIds } from '~/queries/wallets/useWalletIds';

type WalletKey = [Address, WalletRef];

const selectedWallet = atom<WalletKey | null>({
  key: 'selectedWallet',
  default: null,
  effects: [persistAtom()],
});

export const useSelectedWalletId = (): WalletId => {
  const { walletIds } = useWalletIds();
  const selected = useRecoilValue(selectedWallet);

  return selected
    ? {
        id: getWalletId(selected[0], selected[1]),
        accountAddr: selected[0],
        ref: selected[1],
      }
    : walletIds[0];
};

export const useSelectedWallet = () => useWallet(useSelectedWalletId());

export const useSelectWallet = () => {
  const select = useSetRecoilState(selectedWallet);

  return useCallback(
    (acc: WalletId) => select([acc.accountAddr, acc.ref]),
    [select],
  );
};
