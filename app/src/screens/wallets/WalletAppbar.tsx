import { useNavigation } from '@react-navigation/native';
import { AddIcon, DeleteIcon } from '@util/theme/icons';
import { FC, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteWallet } from '~/mutations/wallet/delete/useDeleteWallet';
import { CombinedWallet } from '~/queries/wallets';

export interface WalletAppbarProps {
  wallet: CombinedWallet;
  AppbarHeader: FC<AppbarHeaderProps>;
  existing: boolean;
}

export const WalletAppbar = ({
  wallet,
  AppbarHeader,
  existing,
}: WalletAppbarProps) => {
  const deleteWallet = useDeleteWallet(wallet);

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title={existing ? 'Wallet' : 'Create Wallet'} />

      <Appbar.Action icon={DeleteIcon} onPress={deleteWallet} />
    </AppbarHeader>
  );
};
