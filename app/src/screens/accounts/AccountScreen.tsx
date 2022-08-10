import { Box } from '@components/Box';
import { DeleteIcon } from '@util/theme/icons';
import { Id } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { Appbar } from 'react-native-paper';
import { useAppbarHeader } from '~/components2/Appbar/useAppbarHeader';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteAccount } from '~/mutations/account/useDeleteAccount';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccount } from '~/queries/account/useAccount';

export interface AccountScreenParams {
  id?: Id;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = ({ route, navigation }: AccountScreenProps) => {
  const existing = useAccount(route.params.id);
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const deleteAccount = useDeleteAccount();

  return (
    <Box>
      <AppbarHeader mode="medium">
        <Appbar.BackAction onPress={useGoBack()} />
        <Appbar.Content title="Account" />

        {existing && (
          <Appbar.Action
            icon={DeleteIcon}
            onPress={() => deleteAccount(existing)}
          />
        )}
      </AppbarHeader>

      <FlatList />
    </Box>
  );
};
