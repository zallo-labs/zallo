import { persistAtom } from '@util/effect/persistAtom';
import { WalletRef, Address } from 'lib';
import { useCallback, useMemo } from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { CombinedWallet } from '~/queries/wallets';
import { useWallets } from '~/queries/wallets/useWallets';
import { useAccounts } from '~/queries/account/useAccounts';

type WalletKey = [Address, WalletRef];

const selectedWallet = atom<WalletKey | null>({
  key: 'selectedWallet',
  default: null,
  effects: [persistAtom()],
});

export const useSelectedWallet = () => {
  const { wallets } = useWallets();
  const { accounts } = useAccounts();
  const key = useRecoilValue(selectedWallet);

  return useMemo(() => {
    const wallet =
      (key &&
        wallets.find((a) => a.accountAddr === key[0] && a.ref === key[1])) ||
      wallets[0];

    const account = accounts.find(
      (s) => s.contract.address === wallet.accountAddr,
    )!;

    return { ...wallet, account };
  }, [wallets, key, accounts]);
};

export const useSelectWallet = () => {
  const select = useSetRecoilState(selectedWallet);

  return useCallback(
    (acc: CombinedWallet) => select([acc.accountAddr, acc.ref]),
    [select],
  );
};
