import { ReactNode, useEffect, useState } from 'react';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { DateTime, Duration } from 'luxon';
import { persistedAtom } from '~/util/persistedAtom';
import { Blur } from '~/components/Blur';
import { useAtomValue } from 'jotai';
import { AppState } from 'react-native';

export const SUPPORTS_BIOMETRICS = Auth.isEnrolledAsync();

export const AUTH_SETTINGS_ATOM = persistedAtom('AuthenticationSettings', {
  require: null as boolean | null,
});

const TIMEOUT_AFTER = Duration.fromObject({ minutes: 5 }).toMillis();
const isStillActive = (lastActive?: DateTime) =>
  !!lastActive && DateTime.now().diff(lastActive).toMillis() < TIMEOUT_AFTER;

interface AuthState {
  success?: boolean;
  lastActive?: DateTime;
}

export interface AuthGateProps {
  children: ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  const { require } = useAtomValue(AUTH_SETTINGS_ATOM);

  const [auth, setAuth] = useState<AuthState>({ success: !require });

  // Try authenticate
  useAsyncEffect(
    async (isMounted) => {
      if (!auth.success) {
        const r = await Auth.authenticateAsync({ promptMessage: 'Authenticate to continue' });
        const success = r.success || !(await SUPPORTS_BIOMETRICS); // Succeed if the user has removed biometrics
        if (isMounted()) setAuth({ success });
      }
    },
    [auth, setAuth],
  );

  // Unauthenticate if app had left foreground
  useEffect(() => {
    if (!require) return;

    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') {
        setAuth(({ lastActive }) => ({ success: isStillActive(lastActive) }));
      } else {
        setAuth((prev) => ({ ...prev, lastActive: DateTime.now() }));
      }
    });

    return () => listener.remove();
  }, []);

  return (
    <>
      {children}
      {!auth.success && <Blur blurAmount={20} />}
    </>
  );
};
