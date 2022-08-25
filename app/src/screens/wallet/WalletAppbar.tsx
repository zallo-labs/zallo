import { DeleteIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { ProposableStatusButton } from '~/components/ProposableStatus/ProposableStatusButton';
import { useDeleteWallet } from '~/mutations/wallet/delete/useDeleteWallet';
import { CombinedWallet } from '~/queries/wallets';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';
import { AppbarExtraContent } from '~/components/Appbar/AppbarExtraContent';

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
  const [deleteWallet] = useDeleteWallet(wallet);
  const confirmDelete = useDeleteConfirmation();

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <AppbarExtraContent>
        <ProposableStatusButton state={wallet.state} />
      </AppbarExtraContent>

      <Appbar.Content title={existing ? 'Wallet' : 'Create Wallet'} />

      <Appbar.Action
        icon={DeleteIcon}
        onPress={() => confirmDelete(deleteWallet)}
      />
    </AppbarHeader>
  );
};
