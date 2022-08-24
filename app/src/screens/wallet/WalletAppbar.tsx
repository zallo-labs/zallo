import { DeleteIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarCenterContent } from '~/components/Appbar/AppbarCenterContent';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { ProposalableStatus } from '~/components/ProposalableStatus';
import { useDeleteWallet } from '~/mutations/wallet/delete/useDeleteWallet';
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

      <AppbarCenterContent>
        <ProposalableStatus
          state={wallet.state}
          proposal={
            wallet.proposedModificationHash
              ? {
                  account: wallet.accountAddr,
                  hash: wallet.proposedModificationHash,
                }
              : undefined
          }
        />
      </AppbarCenterContent>

      <Appbar.Content title={existing ? 'Wallet' : 'Create Wallet'} />

      <Appbar.Action
        icon={DeleteIcon}
        onPress={() => confirmDelete(deleteWallet)}
      />
    </AppbarHeader>
  );
};
