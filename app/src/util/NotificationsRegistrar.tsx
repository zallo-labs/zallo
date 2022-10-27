import { PROJECT_ID } from 'app.config';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { DevicePushToken } from 'expo-notifications';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { ProposalStatus } from '~/gql/generated.api';
import { useRegisterPushToken } from '~/mutations/useRegisterPushToken.api';
import { useProposalsMetadata } from '~/queries/proposal/useProposalsMetadata.api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationsRegistrar = () => {
  const register = useRegisterPushToken();
  const [proposalsAwaitingUser] = useProposalsMetadata({ status: ProposalStatus.AwaitingUser });

  // Set badge count
  useEffect(() => {
    Notifications.setBadgeCountAsync(proposalsAwaitingUser.length);
  }, [proposalsAwaitingUser.length]);

  const tryRegister = useCallback(
    async (devicePushToken?: DevicePushToken) => {
      // Notifications don't work on emulators
      if (!Device.isDevice) return undefined;

      const perms = await Notifications.getPermissionsAsync();
      let granted = perms.granted;
      if (!granted && perms.canAskAgain)
        granted = (await Notifications.requestPermissionsAsync()).granted;
      if (!granted) return undefined;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          showBadge: true,
          enableLights: true,
          enableVibrate: true,
        });
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: PROJECT_ID,
          devicePushToken,
        })
      ).data;

      await register(token);
    },
    [register],
  );

  useEffect(() => {
    tryRegister();

    // Push token added or changed
    const sub = Notifications.addPushTokenListener(tryRegister);

    return () => {
      sub.remove();
    };
  }, [tryRegister]);

  return null;
};
