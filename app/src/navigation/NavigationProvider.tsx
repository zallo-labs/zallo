import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  addBreadcrumb,
  SENTRY_ROUTING_INSTRUMENTATION,
} from '~/util/sentry/sentry';
import { NAVIGATION_THEME } from '~/util/theme/navigation';
import { ReactNode, useCallback, useRef } from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>();

  const handleReady = useCallback(() => {
    SENTRY_ROUTING_INSTRUMENTATION.registerNavigationContainer(navigationRef);

    routeNameRef.current = navigationRef?.getCurrentRoute()?.name;
  }, [navigationRef]);

  const handleStateChange = useCallback(async () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName) {
      addBreadcrumb({
        level: 'info',
        type: 'navigation',
        data: {
          from: previousRouteName,
          to: currentRouteName,
        },
      });
    }

    // Save the current route name for later comparison
    routeNameRef.current = currentRouteName;
  }, [navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={NAVIGATION_THEME}
      onReady={handleReady}
      onStateChange={handleStateChange}
    >
      {children}
    </NavigationContainer>
  );
};
