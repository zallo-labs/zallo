import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { ChildrenProps } from '@util/children';
import {
  addBreadcrumb,
  Severity,
  SENTRY_ROUTING_INSTRUMENTATION,
} from '@util/sentry/sentry';
import { NAVIGATION_THEME } from '@util/theme/navigation';
import { useCallback, useRef } from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export const NavigationProvider = ({ children }: ChildrenProps) => {
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
        level: Severity.Info,
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
