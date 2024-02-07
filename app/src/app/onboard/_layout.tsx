import { Drawer } from '#/drawer/Drawer';
import { DrawerSurface } from '#/drawer/DrawerSurface';
import { Drawer as RnpDrawer } from 'react-native-paper';
import { DrawerItem } from '#/drawer/DrawerItem';
import { StyleSheet } from 'react-native';
import { FingerprintIcon, ZalloLogo, NotificationsIcon, AccountIcon } from '@theme/icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

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
      <ZalloLogo style={styles.logo} contentFit="contain" />

      <RnpDrawer.Section title="Onboarding" showDivider={false}>
        <DrawerItem href={`/onboard/account`} icon={AccountIcon} label="Account" />
        <DrawerItem
          href={`/onboard/auth`}
          icon={FingerprintIcon}
          label="Authentication"
          disabled={position < ORDER.auth}
        />
        <DrawerItem
          href={`/onboard/notifications`}
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
