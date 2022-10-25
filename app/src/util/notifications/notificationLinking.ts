import * as Notifications from 'expo-notifications';

const getUrl = (resp: Notifications.NotificationResponse | null) =>
  resp?.notification.request.content.data.url as string | undefined;

export const getInitialURL = async () =>
  getUrl(await Notifications.getLastNotificationResponseAsync());

export const subscribe = (listener: (url: string) => void) => {
  const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
    const url = getUrl(resp);
    if (url) listener(url);
  });

  return sub;
};
