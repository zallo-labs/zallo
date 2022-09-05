import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  AccountIcon,
  ContactsIcon,
  FeedbackIcon,
  IssueIcon,
  SettingsIcon,
  TokenCurrencyIcon,
  WalletIcon,
} from '~/util/theme/icons';
import { useCallback } from 'react';
import { Linking } from 'react-native';
import { Drawer } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { Navigate } from '../useRootNavigation';
import { DeviceItem } from './DeviceItem';

enum Link {
  Issues = 'https://github.com/AlloPay/AlloPay/issues',
  Feedback = 'mailto:feedback@allopay.io',
}

export interface DrawerContentProps extends DrawerContentComponentProps {}

export const DrawerContent = ({ navigation }: DrawerContentProps) => {
  const navigate: Navigate = useCallback(
    (...params: Parameters<Navigate>) => {
      navigation.navigate(...params);
      navigation.closeDrawer();
    },
    [navigation],
  );

  return (
    <DrawerContentScrollView>
      <Drawer.Section>
        <DeviceItem />
      </Drawer.Section>

      <Drawer.Section title="Actions">
        <Drawer.Item
          label="Contacts"
          icon={ContactsIcon}
          onPress={() => navigate('Contacts', {})}
        />
        <Drawer.Item
          label="Tokens"
          icon={TokenCurrencyIcon}
          onPress={() => navigate('Tokens', {})}
        />
      </Drawer.Section>

      <Drawer.Section title="Configuration">
        <Drawer.Item
          label="Accounts"
          icon={AccountIcon}
          onPress={() => navigate('Accounts', {})}
        />
        <Drawer.Item
          label="Wallets"
          icon={WalletIcon}
          onPress={() => navigate('Wallets')}
        />
        <Drawer.Item label="Settings" icon={SettingsIcon} />
      </Drawer.Section>

      <Drawer.Section title="Support">
        <Drawer.Item
          label="Report an issue"
          icon={IssueIcon}
          onPress={() => WebBrowser.openBrowserAsync(Link.Issues)}
        />
        <Drawer.Item
          label="Provide feedback"
          icon={FeedbackIcon}
          onPress={() => Linking.openURL(Link.Feedback)}
        />
      </Drawer.Section>
    </DrawerContentScrollView>
  );
};
