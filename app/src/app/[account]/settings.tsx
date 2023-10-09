import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ContactsIcon,
  FingerprintIcon,
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
import { Screen } from '~/components/layout/Screen';
import { ListItem } from '~/components/list/ListItem';
import * as Linking from 'expo-linking';
import { CONFIG } from '~/util/config';
import { ZERO_ADDR } from 'lib';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { gql } from '@api/generated';
import { ICON_SIZE } from '@theme/paper';
import { ETH_ICON_URI } from '~/components/token/TokenIcon';
import { useQuery } from '~/gql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';

const Query = gql(/* GraphQL */ `
  query Settings {
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

export type SettingsScreenRoute = `/[account]/settings`;
export type SettingsScreenParams = SearchParams<SettingsScreenRoute>;

export default function SettingsScreen() {
  const { account } = useLocalSearchParams<SettingsScreenParams>();
  const styles = useStyles();
  const router = useRouter();

  const { user, approver } = useQuery(Query).data;

  return (
    <Screen>
      <AppbarOptions headline="Settings" />

      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.userContainer} onPress={() => router.push(`/user`)}>
          <AddressIcon address={approver?.address || ZERO_ADDR} size={ICON_SIZE.large} />

          <Text variant="titleLarge" style={styles.userName}>
            {user.name}
          </Text>

          <Text variant="bodyLarge" style={styles.approverItem}>
            {approver?.name}
          </Text>
        </TouchableOpacity>

        <ListItem
          leading={WalletConnectIcon}
          headline="Sessions"
          trailing={NavigateNextIcon}
          onPress={() => router.push({ pathname: `/[account]/sessions`, params: { account } })}
        />

        <ListItem
          leading={() => <Image source={ETH_ICON_URI} style={styles.icon} />}
          headline="Tokens"
          trailing={NavigateNextIcon}
          onPress={() => router.push({ pathname: `/[account]/tokens`, params: { account } })}
        />

        <ListItem
          leading={ContactsIcon}
          headline="Contacts"
          trailing={NavigateNextIcon}
          onPress={() => router.push(`/contacts`)}
        />

        <ListItem
          leading={FingerprintIcon}
          headline="Auth"
          trailing={NavigateNextIcon}
          onPress={() => router.push(`/settings/auth`)}
        />

        <ListItem
          leading={NotificationsIcon}
          headline="Notifications"
          trailing={NavigateNextIcon}
          onPress={() => router.push(`/settings/notifications`)}
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
}

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
