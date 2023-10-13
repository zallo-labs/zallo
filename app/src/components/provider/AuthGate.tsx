import { ReactNode, useEffect, useState } from 'react';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { DateTime, Duration } from 'luxon';
import { persistedAtom } from '~/lib/persistedAtom';
import { Blur } from '~/components/Blur';
import { useAtomValue } from 'jotai';
import { AppState } from 'react-native';

export const SUPPORTS_BIOMETRICS = Auth.isEnrolledAsync();
const TIMEOUT_AFTER = Duration.fromObject({ minutes: 5 }).toMillis();

export const authenticate = async (opts?: Auth.LocalAuthenticationOptions) => {
  const resp = await Auth.authenticateAsync({ promptMessage: 'Authenticate to continue', ...opts });
  return resp.success || !(await SUPPORTS_BIOMETRICS); // Succeed if the user has removed biometrics
};

export const AUTH_SETTINGS_ATOM = persistedAtom('AuthenticationSettings', {
  open: null as null | boolean,
  approval: true,
});
export const useAuthSettings = () => useAtomValue(AUTH_SETTINGS_ATOM);

interface AuthState {
  success?: boolean;
  lastAuthenticated?: DateTime;
}

export interface AuthGateProps {
  children: ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  const { open: require } = useAuthSettings();

  const [auth, setAuth] = useState<AuthState>({ success: !require });

  // Try authenticate
  useAsyncEffect(
    async (isMounted) => {
      if (!auth.success) {
        const success = await authenticate();
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
        setAuth((prev) =>
          prev.lastAuthenticated
            ? { success: DateTime.now().diff(prev.lastAuthenticated).toMillis() < TIMEOUT_AFTER }
            : prev,
        );
      } else if (newState === 'background') {
        setAuth((prev) =>
          prev.success
            ? { ...prev, lastAuthenticated: DateTime.now() }
            : // Re-render to prompt authentication
              {},
        );
      }
    });

    return () => listener.remove();
  }, [require, setAuth]);

  return (
    <>
      {children}
      {!auth.success && <Blur blurAmount={16} />}
    </>
  );
};
