import {
  ContactsIcon,
  GithubIcon,
  NavigateNextIcon,
  NotificationsIcon,
  TwitterIcon,
  WalletConnectIcon,
} from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Image } from 'expo-image';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ListItem } from '~/components/list/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import * as Linking from 'expo-linking';
import { CONFIG } from '~/util/config';
import { Address } from 'lib';
import { FingerprintIcon } from '../biometrics/BiometricsScreen';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { gql } from '@api/generated';
import { ICON_SIZE } from '@theme/paper';
import { ETH_ICON_URI } from '~/components/token/TokenIcon/TokenIcon';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query SettingsScreen {
    user {
      id
      name
    }

    approver {
      id
      address
      name
    }
  }
`);

export interface SettingsScreenParams {
  account: Address;
}

export type SettingsScreenProps = StackNavigatorScreenProps<'Settings'>;

export const SettingsScreen = withSuspense(
  ({ route, navigation: { navigate } }: SettingsScreenProps) => {
    const { account } = route.params;
    const styles = useStyles();

    const { user, approver } = useQuery(Query).data;

    return (
      <Screen>
        <Appbar mode="small" leading="back" headline="Settings" />

        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.userContainer} onPress={() => navigate('User')}>
            <AddressIcon address={approver.address} size={ICON_SIZE.large} />

            <Text variant="titleLarge" style={styles.userName}>
              {user.name}
            </Text>

            <Text variant="bodyLarge" style={styles.approverItem}>
              {approver.name}
            </Text>
          </TouchableOpacity>

          <ListItem
            leading={WalletConnectIcon}
            headline="Sessions"
            trailing={NavigateNextIcon}
            onPress={() => navigate('Sessions', { account })}
          />

          <ListItem
            leading={() => <Image source={ETH_ICON_URI} style={styles.icon} />}
            headline="Tokens"
            trailing={NavigateNextIcon}
            onPress={() => navigate('Tokens', { account })}
          />

          <ListItem
            leading={ContactsIcon}
            headline="Contacts"
            trailing={NavigateNextIcon}
            onPress={() => navigate('Contacts', {})}
          />

          <ListItem
            leading={FingerprintIcon}
            headline="Biometrics"
            trailing={NavigateNextIcon}
            onPress={() => navigate('Biometrics', {})}
          />

          <ListItem
            leading={NotificationsIcon}
            headline="Notifications"
            trailing={NavigateNextIcon}
            onPress={() => navigate('NotificationSettings', {})}
          />

          <ListItem
            leading={TwitterIcon}
            headline="Contact us"
            // supporting="Tweet at us, or slide into our DMs for support"
            trailing={NavigateNextIcon}
            onPress={() => Linking.openURL(CONFIG.metadata.twitter)}
          />

          <ListItem
            leading={GithubIcon}
            headline="GitHub"
            // supporting="Contribute to Zallo under the AGPL-3.0 license"
            trailing={NavigateNextIcon}
            onPress={() => Linking.openURL(CONFIG.metadata.github)}
          />
        </ScrollView>
      </Screen>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ colors, iconSize }) => ({
  container: {
    flex: 1,
  },
  icon: {
    width: iconSize.small,
    height: iconSize.small,
  },
  userContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  userName: {
    marginTop: 8,
  },
  approverItem: {
    color: colors.tertiary,
  },
}));
