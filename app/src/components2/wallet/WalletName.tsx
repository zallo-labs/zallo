import { useMemo } from 'react';
import { elipseTruncate } from '@util/format';
import { CombinedWallet } from '~/queries/wallets';

export const effectiveWalletName = ({ name, ref }: CombinedWallet) =>
  name || `Wallet ${elipseTruncate(ref, 6, 4)}`;

export interface WalletNameProps {
  wallet: CombinedWallet;
}

export const WalletName = ({ wallet }: WalletNameProps) => {
  const formatted = useMemo(() => effectiveWalletName(wallet), [wallet]);

  return <>{formatted}</>;
};
