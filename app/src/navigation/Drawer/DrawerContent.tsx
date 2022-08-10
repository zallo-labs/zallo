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
  TokenIcon,
  WalletIcon,
} from '@util/theme/icons';
import { useCallback } from 'react';
import { Linking } from 'react-native';
import { Drawer } from 'react-native-paper';
import { BottomNavigatorProps } from '../BottomNavigator';

type Navigate = BottomNavigatorProps['navigation']['navigate'];

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
      <Drawer.Section title="Actions">
        <Drawer.Item
          label="Contacts"
          icon={ContactsIcon}
          onPress={() => navigate('Contacts', {})}
        />
        <Drawer.Item
          label="Tokens"
          icon={TokenIcon}
          onPress={() => navigate('Tokens', {})}
        />
      </Drawer.Section>

      <Drawer.Section title="Configuration">
        <Drawer.Item label="Wallets" icon={WalletIcon} />
        <Drawer.Item label="Accounts" icon={AccountIcon} />
        <Drawer.Item label="Settings" icon={SettingsIcon} />
      </Drawer.Section>

      <Drawer.Section title="Support">
        <Drawer.Item
          label="Report an issue"
          icon={IssueIcon}
          onPress={() =>
            Linking.openURL('https://github.com/AlloPay/AlloPay/issues')
          }
        />
        <Drawer.Item
          label="Provide feedback"
          icon={FeedbackIcon}
          onPress={() => Linking.openURL('mailto:feedback@allopay.io')}
        />
      </Drawer.Section>
    </DrawerContentScrollView>
  );
};
