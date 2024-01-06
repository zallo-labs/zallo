import type { NotificationChannelInput } from 'expo-notifications';
import { FC } from 'react';
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAtomValue } from 'jotai';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';

import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { persistedAtom } from '~/lib/persistedAtom';
import { ActivityIcon, IconProps, TransferIcon, UpdateIcon } from '~/util/theme/icons';

export type NotificationChannel = 'product' | 'activity' | 'transfers';
export const NotificationChannelConfig: Record<
  NotificationChannel,
  NotificationChannelInput & { icon?: FC<IconProps> }
> = {
  product: {
    name: 'Product updates',
    description: 'New features and announcements',
    icon: UpdateIcon,
    importance: Notifications.AndroidImportance.DEFAULT,
  },
  transfers: {
    name: 'Transfers',
    description: 'Incoming tokens and allowances',
    icon: TransferIcon,
    importance: Notifications.AndroidImportance.DEFAULT,
    showBadge: false,
    enableLights: false,
    enableVibrate: false,
  },
  activity: {
    name: 'Account activity',
    description: 'Proposal approvals',
    icon: ActivityIcon,
    importance: Notifications.AndroidImportance.MAX,
    showBadge: true,
    enableLights: true,
    enableVibrate: true,
  },
};

const DEFAULT_SETTINGS: Record<NotificationChannel, boolean> = {
  activity: true,
  product: true,
  transfers: true,
};

const NOTIFICATIONS_ATOM = persistedAtom<Partial<Record<NotificationChannel, boolean>>>(
  'Notifications',
  DEFAULT_SETTINGS,
);

export const useNotificationSettings = () => ({
  ...DEFAULT_SETTINGS,
  ...useAtomValue(NOTIFICATIONS_ATOM),
});

export interface NotificationSettingsProps {
  next?: () => void;
  appbarMenu?: boolean;
}

function NotificationSettings({ next, appbarMenu }: NotificationSettingsProps) {
  const [settings, update] = useImmerAtom(NOTIFICATIONS_ATOM);

  const [perm, requestPerm] = Notifications.usePermissions({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowProvisional: true,
      provideAppNotificationSettings: true,
    },
  });

  return (
    <>
      <AppbarOptions
        mode="large"
        {...(appbarMenu && { leading: AppbarMenu })}
        headline="Notifications"
      />

      <ScreenSurface style={styles.surface}>
        <ListHeader>Receive</ListHeader>

        {Object.entries(NotificationChannelConfig).map(([channel, config]) => (
          <ListItem
            key={channel}
            leading={config.icon}
            headline={config.name}
            supporting={config.description}
            trailing={
              <Switch
                value={settings[channel as NotificationChannel] ?? true}
                onValueChange={(v) =>
                  update((s) => {
                    s[channel as NotificationChannel] = v;
                  })
                }
              />
            }
          />
        ))}

        <Actions>
          {!perm?.granted && next && <Button onPress={next}>Skip</Button>}

          {(!perm?.granted || next) && (
            <Button
              mode="contained"
              onPress={async () => {
                await requestPerm();
                next?.();
              }}
            >
              {perm?.granted ? 'Continue' : 'Enable'}
            </Button>
          )}
        </Actions>
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  surface: {
    paddingTop: 8,
  },
});

export default withSuspense(NotificationSettings, <ScreenSkeleton />);
