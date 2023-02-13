import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { ContactsIcon, SettingsIcon, HomeIcon, PlusIcon } from '~/util/theme/icons';
import { Suspense, useCallback } from 'react';
import { Drawer } from 'react-native-paper';
import { Navigate } from '../useRootNavigation';
import { useAccountIds } from '~/queries/account/useAccounts.api';
import { AccountDrawerItem } from './AccountDrawerItem';
import { LineSkeleton } from '~/components/skeleton/LineSkeleton';
import { NavigationState } from '@react-navigation/native';

const getRouteName = (state: NavigationState): string => {
  const route = state.routes[state.index];
  return route.state ? getRouteName(route.state as NavigationState) : route.name;
};

const HOME_ROUTES = new Set(['RootNavigator', 'Receive', 'Home', 'Activity']);

export interface DrawerContentProps extends DrawerContentComponentProps {}

export const DrawerContent = (props: DrawerContentProps) => {
  const { navigation } = props;
  const accountIds = useAccountIds();
  const route = getRouteName(props.state);

  const navigate: Navigate = useCallback(
    (...params: Parameters<Navigate>) => {
      navigation.navigate(...params);
      navigation.closeDrawer();
    },
    [navigation],
  );

  return (
    <DrawerContentScrollView {...props}>
      <Drawer.Section title="Zallo" showDivider={false}>
        {null}
      </Drawer.Section>

      <Drawer.Section title="General">
        <Drawer.Item
          label="Home"
          icon={HomeIcon}
          onPress={() => navigate('Home')}
          active={HOME_ROUTES.has(route)}
        />

        <Drawer.Item
          label="Contacts"
          icon={ContactsIcon}
          onPress={() => navigate('Contacts', {})}
          active={route === 'Contacts'}
        />
        <Drawer.Item
          label="Settings"
          icon={SettingsIcon}
          onPress={() => navigate('Settings')}
          active={route === 'Settings'}
        />
      </Drawer.Section>

      {/* <Drawer.Section title="Actions">
        <Drawer.Item label="Swap" />

        <Drawer.Item label="Deposit fiat" />
      </Drawer.Section> */}

      <Drawer.Section title="Accounts" showDivider={false}>
        <Suspense fallback={<LineSkeleton />}>
          {accountIds.map((account) => (
            <AccountDrawerItem key={account} account={account} />
          ))}
        </Suspense>

        <Drawer.Item
          label="Create account"
          icon={PlusIcon}
          onPress={() => navigate('CreateAccount', {})}
        />
      </Drawer.Section>
    </DrawerContentScrollView>
  );
};
