import { useApprover } from '@network/useApprover';
import { ContactsIcon, GithubIcon, TwitterIcon, WalletConnectIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ETH } from '@token/tokens';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ListItem } from '~/components/list/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import * as Linking from 'expo-linking';
import { CONFIG } from '~/util/config';

export type SettingsScreenProps = StackNavigatorScreenProps<'Settings'>;

export const SettingsScreen = ({ navigation: { navigate } }: SettingsScreenProps) => {
  const styles = useStyles();
  const account = useSelectedAccountId();
  const approver = useApprover();

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
          leading={approver.address}
          headline="User"
          supporting="Manage the user for this device"
          onPress={() => navigate('User')}
        />

        <ListItem
          leading={(props) => <WalletConnectIcon {...props} size={styles.icon.width} />}
          headline="Sessions"
          supporting="Manage WalletConnect sessions"
          onPress={() => navigate('Sessions')}
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
