import { ReactNode, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { Suspend } from '~/components/Suspender';
import { DateTime, Duration } from 'luxon';
import { atom, useRecoilState } from 'recoil';
import { persistAtom } from '~/util/effect/persistAtom';

const IS_FIRST_OPEN = atom({
  key: 'isFirstOpen',
  default: false,
  effects: [persistAtom()],
});

const TIMEOUT_AFTER = Duration.fromObject({ minutes: 5 });

const isStillActive = (lastActive?: DateTime) =>
  !!lastActive && DateTime.now().diff(lastActive).toMillis() < TIMEOUT_AFTER.toMillis();

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
  success?: boolean;
  lastActive?: DateTime;
}

export interface AuthGateProps {
  children: ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  // Use an object to re-render every time setAuth is called
  const [isFirstOpen, setIsFirstOpen] = useRecoilState(IS_FIRST_OPEN);
  const [auth, setAuth] = useState<Auth>(() => {
    if (isFirstOpen) setIsFirstOpen(false);
    return { success: isFirstOpen };
  });

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
      if (newState === 'active') {
        setAuth(({ lastActive }) => ({ success: isStillActive(lastActive) }));
      } else {
        setAuth((prev) => ({ ...prev, lastActive: DateTime.now() }));
      }
    });

    return () => listener.remove();
  }, []);

  if (!auth.success) return <Suspend />;

  return <>{children}</>;
};
