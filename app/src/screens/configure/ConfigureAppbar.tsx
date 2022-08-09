import { useNavigation } from '@react-navigation/native';
import { AddIcon, DeleteIcon } from '@util/theme/icons';
import { FC, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteWallet } from '~/mutations/wallet/delete/useDeleteWallet';
import { CombinedWallet } from '~/queries/wallets';
import { ConfigureScreenProps } from './ConfigureScreen';

export interface ConfigureAppbarProps {
  wallet: CombinedWallet;
  AppbarHeader: FC<AppbarHeaderProps>;
}

export const ConfigureAppbar = ({
  wallet,
  AppbarHeader,
}: ConfigureAppbarProps) => {
  const { navigate } = useNavigation<ConfigureScreenProps['navigation']>();
  const deleteWallet = useDeleteWallet(wallet);

  const addQuorum = useCallback(() => navigate('Quorum', {}), [navigate]);

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title="Configure" />

      <Appbar.Action icon={AddIcon} onPress={addQuorum} />
      <Appbar.Action icon={DeleteIcon} onPress={deleteWallet} />
    </AppbarHeader>
  );
};
