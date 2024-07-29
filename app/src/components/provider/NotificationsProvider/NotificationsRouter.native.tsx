import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { ampli } from '~/lib/ampli';
import { ExpoRouter } from '.expo/types/router';

export function NotificationsRouter() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const handleResponse = (r: Notifications.NotificationResponse | null, appOpened: boolean) => {
      const href: ExpoRouter.Href = r?.notification.request.content.data.href;
      if (href) {
        router.push(href);
        ampli.notificationPressed({
          pathname: typeof href === 'string' ? href : href.pathname,
          appOpened,
        });
      }
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
