import { useApproverAddress } from '@network/useApprover';
import {
  ContactsIcon,
  GithubIcon,
  NotificationsIcon,
  TwitterIcon,
  WalletConnectIcon,
} from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ETH } from '@token/tokens';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ListItem } from '~/components/list/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import * as Linking from 'expo-linking';
import { CONFIG } from '~/util/config';
import { Address } from 'lib';
import { FingerprintIcon } from '../biometrics/BiometricsScreen';

export interface SettingsScreenParams {
  account: Address;
}

export type SettingsScreenProps = StackNavigatorScreenProps<'Settings'>;

export const SettingsScreen = ({ route, navigation: { navigate } }: SettingsScreenProps) => {
  const { account } = route.params;
  const styles = useStyles();
  const approver = useApproverAddress();

  return (
    <Screen>
      <Appbar mode="large" leading="back" headline="Settings" />

      <ScrollView style={styles.container}>
        <ListItem
          leading={account}
          headline="Account"
          supporting={`Manage ${useAddressLabel(account)}`}
          onPress={() => navigate('Account', { account })}
        />

        <ListItem
          leading={approver}
          headline="User"
          supporting="Manage the user for this device"
          onPress={() => navigate('User')}
        />

        <ListItem
          leading={FingerprintIcon}
          leadingSize="medium"
          headline="Biometrics"
          supporting="Configure when biometrics is required"
          onPress={() => navigate('Biometrics', {})}
        />

        <ListItem
          leading={(props) => <WalletConnectIcon {...props} size={styles.icon.width} />}
          headline="Sessions"
          supporting="Manage WalletConnect sessions"
          onPress={() => navigate('Sessions', { account })}
        />

        <ListItem
          leading={() => <Image source={ETH.iconUri} style={styles.icon} />}
          headline="Tokens"
          supporting="Manage supported tokens"
          onPress={() => navigate('Tokens', { account })}
        />

        <ListItem
          leading={(props) => <ContactsIcon {...props} size={styles.icon.width} />}
          headline="Contacts"
          supporting="Manage contacts"
          onPress={() => navigate('Contacts', {})}
        />

        <ListItem
          leading={(props) => <NotificationsIcon {...props} size={styles.icon.width} />}
          headline="Notifications"
          supporting="Choose which notifications to receive"
          onPress={() => navigate('NotificationSettings', {})}
        />

        <Divider horizontalInset />

        <ListItem
          leading={(props) => <TwitterIcon {...props} size={styles.icon.width} />}
          headline="Contact us"
          supporting="Tweet at us, or slide into our DMs"
          onPress={() => Linking.openURL(CONFIG.metadata.twitter)}
        />

        <ListItem
          leading={(props) => <GithubIcon {...props} size={styles.icon.width} />}
          headline="GitHub"
          supporting="Contribute to Zallo under the AGPL-3.0 license"
          onPress={() => Linking.openURL(CONFIG.metadata.github)}
        />
      </ScrollView>
    </Screen>
  );
};

const useStyles = makeStyles(({ iconSize }) => ({
  container: {
    flex: 1,
  },
  icon: {
    width: iconSize.medium,
    height: iconSize.medium,
  },
}));
