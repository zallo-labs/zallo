import { PROJECT_ID } from 'app.config';
import * as Notifications from 'expo-notifications';
import type { DevicePushToken } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  NotificationChannel,
  NotificationChannelConfig,
  useNotificationSettings,
} from '#/NotificationSettings';
import { retryAsync } from '~/util/retry';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { NotificationsRegistrarQuery } from '~/api/__generated__/NotificationsRegistrarQuery.graphql';
import { useMutation } from '~/api';

const Query = graphql`
  query NotificationsRegistrarQuery {
    approver {
      id
      details @required(action: NONE) {
        id
        pushToken
      }
    }

    accounts {
      id
      proposals(input: { pending: true }) @required(action: NONE) {
        id
      }
    }
  }
`;

const UpdatePushToken = graphql`
  mutation NotificationsRegistrarMutation($pushToken: String) {
    updateApprover(input: { pushToken: $pushToken }) {
      id
      details {
        id
        pushToken
      }
    }
  }
`;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationsRegistrar = () => {
  const channelEnabled = useNotificationSettings();
  const updatePushToken = useMutation(UpdatePushToken);

  const { approver, accounts } = useLazyQuery<NotificationsRegistrarQuery>(Query, {});

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

            if (pushToken !== approver?.details?.pushToken) await updatePushToken({ pushToken });
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
  const proposals = accounts.reduce((n, account) => n + (account?.proposals.length ?? 0), 0);
  useEffect(() => {
    if (hasPermission) Notifications.setBadgeCountAsync(proposals);
  }, [hasPermission, proposals]);

  return null;
};

function isMissingAndroidPlayServicesError(e: unknown): boolean {
  return e instanceof Error && e.message.includes('MISSING_INSTANCEID_SERVICE');
}
