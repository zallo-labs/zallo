import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export function NotificationsRouter() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const handleResponse = (r: Notifications.NotificationResponse | null) => {
      const url = r?.notification.request.content.data.url;
      if (url) router.push(url);
    };

    // User opened up through pressing notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (isMounted) handleResponse(response);
    });

    // Notification pressed whilst app open
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleResponse(response);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return null;
}
