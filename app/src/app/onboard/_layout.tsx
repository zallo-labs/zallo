import { Drawer } from '#/drawer/Drawer';
import { DrawerSurface } from '#/drawer/DrawerSurface';
import { Drawer as RnpDrawer } from 'react-native-paper';
import { DrawerItem } from '#/drawer/DrawerItem';
import { FingerprintIcon, NotificationsIcon, AccountIcon } from '@theme/icons';
import { Stack, usePathname } from 'expo-router';
import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { DrawerLogo } from '#/drawer/DrawerLogo';

export default function OnboardingDrawerLayout() {
  return (
    <Drawer drawerContent={Content}>
      <Stack screenOptions={{ header: AppbarHeader }} />
    </Drawer>
  );
}

enum ORDER {
  '/onboard/account' = 1,
  '/onboard/auth',
  '/onboard/notifications',
}

function Content() {
  const pathname = usePathname();
  const position = ORDER[pathname as keyof typeof ORDER] ?? 0;

  return (
    <DrawerSurface>
      <DrawerLogo />

      <RnpDrawer.Section title="Onboarding" showDivider={false}>
        <DrawerItem href="/onboard/account" icon={AccountIcon} label="Account" />
        <DrawerItem
          href="/onboard/auth"
          icon={FingerprintIcon}
          label="Authentication"
          disabled={position < ORDER['/onboard/auth']}
        />
        <DrawerItem
          href="/onboard/notifications"
          icon={NotificationsIcon}
          label="Notifications"
          disabled={position < ORDER['/onboard/notifications']}
        />
      </RnpDrawer.Section>
    </DrawerSurface>
  );
}
