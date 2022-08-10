import { useNavigation } from '@react-navigation/native';
import { AddIcon, DeleteIcon } from '@util/theme/icons';
import { FC, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteWallet } from '~/mutations/wallet/delete/useDeleteWallet';
import { CombinedQuorum, CombinedWallet } from '~/queries/wallets';
import { WalletScreenProps } from './WalletScreen';

export interface WalletAppbarProps {
  wallet: CombinedWallet;
  AppbarHeader: FC<AppbarHeaderProps>;
  addQuorum: (quorum: CombinedQuorum) => void;
}

export const WalletAppbar = ({
  wallet,
  AppbarHeader,
  addQuorum,
}: WalletAppbarProps) => {
  const { navigate } = useNavigation<WalletScreenProps['navigation']>();
  const deleteWallet = useDeleteWallet(wallet);

  const add = useCallback(
    () =>
      navigate('Quorum', {
        onChange: (quorum) => {
          if (quorum) addQuorum(quorum);
        },
      }),
    [addQuorum, navigate],
  );

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title="Configure" />

      <Appbar.Action icon={AddIcon} onPress={add} />
      <Appbar.Action icon={DeleteIcon} onPress={deleteWallet} />
    </AppbarHeader>
  );
};
