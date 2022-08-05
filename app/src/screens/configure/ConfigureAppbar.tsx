import { useNavigation } from '@react-navigation/native';
import { AddIcon, DeleteIcon } from '@util/theme/icons';
import { FC, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteAccount } from '~/mutations/account/delete/useDeleteAccount';
import { CombinedAccount } from '~/queries/accounts';
import { ConfigureScreenProps } from './ConfigureScreen';

export interface ConfigureAppbarProps {
  account: CombinedAccount;
  AppbarHeader: FC<AppbarHeaderProps>;
}

export const ConfigureAppbar = ({
  account,
  AppbarHeader,
}: ConfigureAppbarProps) => {
  const { navigate } = useNavigation<ConfigureScreenProps['navigation']>();
  const deleteAccount = useDeleteAccount(account);

  const addQuorum = useCallback(() => navigate('Quorum', {}), [navigate]);

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title="Configure" />

      <Appbar.Action icon={AddIcon} onPress={addQuorum} />
      <Appbar.Action icon={DeleteIcon} onPress={deleteAccount} />
    </AppbarHeader>
  );
};
