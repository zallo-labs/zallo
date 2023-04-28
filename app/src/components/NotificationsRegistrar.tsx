import { PROJECT_ID } from '../../app.config';
import * as Notifications from 'expo-notifications';
import type { DevicePushToken } from 'expo-notifications';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useUpdateUser } from '@api/user';
import { useProposals } from '@api/proposal';
import {
  NotificationChannel,
  NotificationChannelConfig,
  useNotificationSettings,
} from '~/screens/notifications/NotificationSettingsScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotificationsCount = () => useProposals({ requiresUserAction: true }).length;

export const NotificationsRegistrar = () => {
  const channelEnabled = useNotificationSettings();
  const count = useNotificationsCount();
  const updateUser = useUpdateUser();

  const hasPermission = Notifications.usePermissions()[0]?.granted;

  // Set badge count
  useEffect(() => {
    if (hasPermission) Notifications.setBadgeCountAsync(count);
  }, [hasPermission, count]);

  const tryRegister = useCallback(
    async (devicePushToken: DevicePushToken) => {
      if (Platform.OS === 'android') {
        for (const [channel, config] of Object.entries(NotificationChannelConfig)) {
          if (channelEnabled[channel as NotificationChannel]) {
            Notifications.setNotificationChannelAsync(channel, config);
          } else {
            Notifications.deleteNotificationChannelAsync(channel);
          }
        }
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: PROJECT_ID,
          devicePushToken,
        })
      ).data;

      await updateUser({ pushToken: token });
    },
    [hasPermission, updateUser],
  );

  useEffect(() => {
    if (!hasPermission) return;

    Notifications.getDevicePushTokenAsync().then(tryRegister);
    const listener = Notifications.addPushTokenListener(tryRegister);

    return () => {
      listener.remove();
    };
  }, [hasPermission, tryRegister]);

  return null;
};
