import { useApproverAddress } from '@network/useApprover';
import {
  ContactsIcon,
  GithubIcon,
  NavigateNextIcon,
  NotificationsIcon,
  TwitterIcon,
  WalletConnectIcon,
} from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ETH } from '@token/tokens';
import { Image } from 'expo-image';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { AddressLabel, useAddressLabel } from '~/components/address/AddressLabel';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ListItem } from '~/components/list/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import * as Linking from 'expo-linking';
import { CONFIG } from '~/util/config';
import { Address } from 'lib';
import { FingerprintIcon } from '../biometrics/BiometricsScreen';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { SettingsDocument, SettingsQuery, SettingsQueryVariables } from '@api/generated';
import { Chevron } from '~/components/Chevron';
import { ICON_SIZE } from '@theme/paper';

gql(/* GraphQL */ `
  query Settings {
    user {
      id
      name
    }
  }
`);

export interface SettingsScreenParams {
  account: Address;
}

export type SettingsScreenProps = StackNavigatorScreenProps<'Settings'>;

export const SettingsScreen = ({ route, navigation: { navigate } }: SettingsScreenProps) => {
  const { account } = route.params;
  const styles = useStyles();
  const approver = useApproverAddress();

  const { user } = useSuspenseQuery<SettingsQuery, SettingsQueryVariables>(SettingsDocument).data;

  return (
    <Screen>
      <Appbar mode="small" leading="back" headline="Settings" />

      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.userContainer} onPress={() => {}}>
          <AddressIcon address={approver} size={ICON_SIZE.large} />

          <Text variant="titleLarge" style={styles.userName}>
            {user.name}
          </Text>

          <View style={styles.approverContainer}>
            <View style={styles.approverChevron} />

            <Text variant="bodyLarge" style={styles.approverItem}>
              <AddressLabel address={approver} />
            </Text>

            <Chevron style={[styles.approverChevron, styles.approverItem]} />
          </View>
        </TouchableOpacity>

        <ListItem
          leading={WalletConnectIcon}
          headline="Sessions"
          trailing={NavigateNextIcon}
          onPress={() => navigate('Sessions', { account })}
        />

        <ListItem
          leading={() => <Image source={ETH.iconUri} style={styles.icon} />}
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
};

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
  approverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approverItem: {
    color: colors.tertiary,
  },
  approverChevron: {
    width: ICON_SIZE.small,
  },
}));
