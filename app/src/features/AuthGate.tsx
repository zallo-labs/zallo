import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { ChildrenProps } from '@util/children';
import { Suspend } from '@components/Suspender';
import { DateTime } from 'luxon';

const isStillActive = (lastActive?: DateTime) =>
  lastActive && DateTime.now().diff(lastActive).as('minutes') < 5;

const tryAuthenticate = async () => {
  try {
    const enrolledLevel = await Auth.getEnrolledLevelAsync();
    if (enrolledLevel === Auth.SecurityLevel.NONE) return true; // What are you gonna do...?

    return (await Auth.authenticateAsync()).success;
  } catch (_) {
    return false;
  }
};

interface Auth {
  success: boolean;
  lastActive?: DateTime;
}

export const AuthGate = ({ children }: ChildrenProps) => {
  // Use an object to re-render every time setAuth is called
  const [auth, setAuth] = useState<Auth>({ success: false });

  // Try authenticate
  useAsyncEffect(
    async (isMounted) => {
      if (!auth.success) {
        console.log('Authenticating...');
        const success = await tryAuthenticate();
        if (isMounted()) setAuth({ success });
      }
    },
    [auth, setAuth],
  );

  // Unauthenticate if app had left foreground
  useEffect(() => {
    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') {
        setAuth(({ lastActive }) => ({
          success: isStillActive(lastActive),
        }));
      } else {
        setAuth((prev) => ({ ...prev, lastActive: DateTime.now() }));
      }
    });

    return () => listener.remove();
  }, []);

  if (!auth.success) return <Suspend />;

  return <>{children}</>;
};
