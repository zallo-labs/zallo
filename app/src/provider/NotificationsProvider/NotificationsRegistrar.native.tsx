import { PROJECT_ID } from '../../../app.config';
import * as Notifications from 'expo-notifications';
import type { DevicePushToken } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  NotificationChannel,
  NotificationChannelConfig,
  useNotificationSettings,
} from '~/screens/notifications/NotificationSettingsScreen';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useMutation } from 'urql';
import { retryAsync } from '~/util/retry';

const Query = gql(/* GraphQL */ `
  query NotificationsRegistrar {
    approver {
      id
      pushToken
    }

    proposals(input: { pending: true }) {
      id
    }
  }
`);

const UpdatePushToken = gql(/* GraphQL */ `
  mutation UpdatePushToken($pushToken: String) {
    updateApprover(input: { pushToken: $pushToken }) {
      id
      pushToken
    }
  }
`);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationsRegistrar = () => {
  const channelEnabled = useNotificationSettings();

  const { approver, proposals } = useQuery(Query).data;
  const updatePushToken = useMutation(UpdatePushToken)[1];

  const hasPermission = Notifications.usePermissions()[0]?.granted;

  // Register
  useEffect(() => {
    if (!hasPermission) return;

    const register = async (devicePushToken?: DevicePushToken) => {
      try {
        await retryAsync(
          async () => {
            if (Platform.OS === 'android') {
              for (const [channel, config] of Object.entries(NotificationChannelConfig)) {
                if (channelEnabled[channel as NotificationChannel]) {
                  Notifications.setNotificationChannelAsync(channel, config);
                }
              }

              const channelsToDelete = (await Notifications.getNotificationChannelsAsync()).filter(
                (c) =>
                  channelEnabled[c.id as NotificationChannel] === false ||
                  !(c.id in NotificationChannelConfig),
              );
              for (const channel of channelsToDelete) {
                Notifications.deleteNotificationChannelAsync(channel.id);
              }
            }

            const pushToken = (
              await Notifications.getExpoPushTokenAsync({
                projectId: PROJECT_ID,
                devicePushToken: devicePushToken ?? (await Notifications.getDevicePushTokenAsync()),
              })
            ).data;

            if (pushToken !== approver?.pushToken) await updatePushToken({ pushToken });
          },
          { delayMs: 2000 },
        );
      } catch (e) {
        if (!isMissingAndroidPlayServicesError(e)) throw e;
      }
    };

    register();
    const listener = Notifications.addPushTokenListener(register);

    return () => {
      listener.remove();
    };
  }, [hasPermission, channelEnabled, approver, updatePushToken]);

  // Set badge count
  useEffect(() => {
    if (hasPermission) Notifications.setBadgeCountAsync(proposals.length);
  }, [hasPermission, proposals.length]);

  return null;
};

function isMissingAndroidPlayServicesError(e: unknown): boolean {
  return e instanceof Error && e.message.includes('MISSING_INSTANCEID_SERVICE');
}
