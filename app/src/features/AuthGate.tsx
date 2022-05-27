import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { ChildrenProps } from '@util/children';
import { Suspend } from '@components/Suspender';

const tryAuthenticate = async () => {
  try {
    const enrolledLevel = await Auth.getEnrolledLevelAsync();
    if (enrolledLevel === Auth.SecurityLevel.NONE) return true; // What are you gonna do...?

    return (await Auth.authenticateAsync()).success;
  } catch (_) {
    return false;
  }
};

export const AuthGate = ({ children }: ChildrenProps) => {
  // Use an object to re-render every time setAuth is called
  const [auth, setAuth] = useState({ success: false });

  // Try authenticate
  useAsyncEffect(
    async (isMounted) => {
      if (!auth.success) {
        const success = await tryAuthenticate();
        if (isMounted()) setAuth({ success });
      }
    },
    [auth, setAuth],
  );

  // Unauthenticate if app had left foreground
  useEffect(() => {
    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') setAuth({ success: false });
    });

    return () => listener.remove();
  }, [setAuth]);

  if (!auth.success) return <Suspend />;

  return <>{children}</>;
};
