import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { ChildrenProps } from '@util/children';
import { Suspend } from '@components/Suspender';

const tryAuthenticate = async () => {
  const enrolledLevel = await Auth.getEnrolledLevelAsync();
  if (enrolledLevel === Auth.SecurityLevel.NONE) return true; // What are you gonna do...?

  return (await Auth.authenticateAsync()).success;
};

export const AuthGate = ({ children }: ChildrenProps) => {
  const [authd, setAuthd] = useState(false);

  // Try authenticate
  useAsyncEffect(
    async (isMounted) => {
      if (!authd) {
        const r = await tryAuthenticate();
        if (isMounted()) setAuthd(r);
      }
    },
    [authd, setAuthd],
  );

  // Unauthenticate if app had left foreground
  useEffect(() => {
    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') setAuthd(false);
    });

    return () => listener.remove();
  }, [setAuthd]);

  if (!authd) return <Suspend />;

  return <>{children}</>;
};
