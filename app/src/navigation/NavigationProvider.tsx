import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { NAVIGATION_THEME } from '~/util/theme/navigation';
import { ReactNode, useCallback, useRef } from 'react';
import { LogBox } from 'react-native';
import * as NotificationsLinking from '~/util/notifications/notificationLinking';
import * as Linking from 'expo-linking';
import { ROUTES } from './routes';
// import analytics from '@react-native-firebase/analytics';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const prefix = Linking.createURL('/');

export interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>();

  const handleReady = useCallback(() => {
    routeNameRef.current = navigationRef?.getCurrentRoute()?.name;
  }, [navigationRef]);

  const handleStateChange = useCallback(async () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName) {
      // analytics().logScreenView({
      //   screen_name: currentRouteName,
      //   screen_class: currentRouteName,
      // });
      // Sentry.addBreadcrumb({
      //   level: 'info',
      //   type: 'navigation',
      //   data: {
      //     from: previousRouteName,
      //     to: currentRouteName,
      //   },
      // });
    }

    routeNameRef.current = currentRouteName;
  }, [navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={NAVIGATION_THEME}
      onReady={handleReady}
      onStateChange={handleStateChange}
      linking={{
        prefixes: [prefix],
        config: ROUTES as any,
        getInitialURL: async () =>
          (await Linking.getInitialURL()) ?? NotificationsLinking.getInitialURL(),
        subscribe: (listener) => {
          // Listen to incoming links from deep linking
          const sub = Linking.addEventListener('url', ({ url }) => listener(url));

          const notificationsSub = NotificationsLinking.subscribe(listener);

          return () => {
            sub.remove();
            notificationsSub.remove();
          };
        },
      }}
    >
      {children}
    </NavigationContainer>
  );
};
