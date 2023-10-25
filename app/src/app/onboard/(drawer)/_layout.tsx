import { Drawer } from '~/components/drawer/Drawer';
import { DrawerSurface } from '~/components/drawer/DrawerSurface';
import { Drawer as RnpDrawer } from 'react-native-paper';
import { DrawerItem } from '~/components/drawer/DrawerItem';
import { StyleSheet } from 'react-native';
import { FingerprintIcon, LogoIcon, NotificationsIcon, UserIcon } from '@theme/icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

export const unstable_settings = {
  initialRouteName: `user`,
};

export default function OnboardingDrawerLayout() {
  return <Drawer drawerContent={Content} />;
}

enum ORDER {
  user = 1,
  auth,
  notifications,
}

function Content({ state }: DrawerContentComponentProps) {
  const position = Math.max(
    ORDER.user,
    ...state.history
      .map(
        (route) =>
          route.type === 'route' &&
          ORDER[state.routes.find((r) => r.key === route.key)?.name as keyof typeof ORDER],
      )
      .filter(Boolean),
  );

  return (
    <DrawerSurface contentContainerStyle={styles.surface}>
      <LogoIcon style={styles.logo} contentFit="contain" />

      <RnpDrawer.Section title="Onboarding" showDivider={false}>
        <DrawerItem href={`/onboard/(drawer)/user`} icon={UserIcon} label="User" />
        <DrawerItem
          href={`/onboard/(drawer)/auth`}
          icon={FingerprintIcon}
          label="Authentication"
          disabled={position < ORDER.auth}
        />
        <DrawerItem
          href={`/onboard/(drawer)/notifications`}
          icon={NotificationsIcon}
          label="Notifications"
          disabled={position < ORDER.notifications}
        />
      </RnpDrawer.Section>
    </DrawerSurface>
  );
}

const styles = StyleSheet.create({
  surface: {
    paddingTop: 32,
  },
  logo: {
    minHeight: 88,
    marginBottom: 24,
  },
});
