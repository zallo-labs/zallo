import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { ampli } from '~/lib/ampli';

export function NotificationsRouter() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const handleResponse = (r: Notifications.NotificationResponse | null, appOpened: boolean) => {
      const pathname = r?.notification.request.content.data.pathname;
      if (pathname) router.push(pathname);
      ampli.notificationPressed({ pathname, appOpened });
    };

    // User opened up through pressing notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (isMounted) handleResponse(response, true);
    });

    // Notification pressed whilst app open
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleResponse(response, false);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [router]);

  return null;
}
