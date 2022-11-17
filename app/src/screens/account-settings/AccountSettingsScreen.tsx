import { Address } from 'lib';
import { Appbar } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { Box } from '~/components/layout/Box';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useAccount } from '~/queries/account/useAccount.api';
import { NameField } from './NameField';

export interface AccountSettingsScreenParams {
  account: Address;
}

export type AccountSettingsScreenProps = RootNavigatorScreenProps<'AccountSettings'>;

export const AccountSettingsScreen = ({ route }: AccountSettingsScreenProps) => {
  const [account] = useAccount(route.params.account);

  return (
    <Box>
      <Appbar.Header mode="large">
        <Appbar.BackAction onPress={useGoBack()} />
        <Appbar.Content title="Account settings" />
      </Appbar.Header>

      <Box mx={2}>
        <NameField account={account} />
      </Box>
    </Box>
  );
};
