import { DeleteIcon } from '@util/theme/icons';
import { FC } from 'react';
import { Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteWallet } from '~/mutations/wallet/delete/useDeleteWallet';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedWallet } from '~/queries/wallets';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';

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
  const confirmDelete = useDeleteConfirmation();

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title={existing ? 'Wallet' : 'Create Wallet'} />

      <Appbar.Action
        icon={DeleteIcon}
        onPress={() => confirmDelete(deleteWallet)}
      />
    </AppbarHeader>
  );
};
