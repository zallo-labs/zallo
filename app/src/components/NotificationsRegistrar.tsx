import { PROJECT_ID } from '../../app.config';
import * as Notifications from 'expo-notifications';
import type { DevicePushToken } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useUpdateUser } from '@api/user';
import { useProposals } from '@api/proposal';
import {
  NotificationChannel,
  NotificationChannelConfig,
  useNotificationSettings,
} from '~/screens/notifications/NotificationSettingsScreen';
import { retryAsPromised } from 'retry-as-promised';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotificationsCount = () => useProposals({ responseRequested: true }).length;

export const NotificationsRegistrar = () => {
  const channelEnabled = useNotificationSettings();
  const count = useNotificationsCount();
  const updateUser = useUpdateUser();

  const hasPermission = Notifications.usePermissions()[0]?.granted;

  // Register
  useEffect(() => {
    if (!hasPermission) return;

    const register = async (devicePushToken?: DevicePushToken) =>
      retryAsPromised(
        async () => {
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
              devicePushToken: devicePushToken ?? (await Notifications.getDevicePushTokenAsync()),
            })
          ).data;

          await updateUser({ pushToken: token });
        },
        { max: 3 },
      );

    register();
    const listener = Notifications.addPushTokenListener(register);

    return () => {
      listener.remove();
    };
  }, [hasPermission, channelEnabled, updateUser]);

  // Set badge count
  useEffect(() => {
    if (hasPermission) Notifications.setBadgeCountAsync(count);
  }, [hasPermission, count]);

  return null;
};
