import { ReactNode, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Auth from 'expo-local-authentication';
import useAsyncEffect from 'use-async-effect';
import { Suspend } from '~/components/Suspender';
import { DateTime, Duration } from 'luxon';
import { tryOrAsync } from 'lib';
import { atom, useRecoilValue } from 'recoil';
import { persistAtom } from '~/util/effect/persistAtom';

const authSettingsAtom = atom({
  key: 'AuthSetings',
  default: {
    requireBiometrics: false,
  },
  effects: [persistAtom()],
});

const tryAuthenticate = async () =>
  tryOrAsync(
    async () =>
      (await Auth.getEnrolledLevelAsync()) !== Auth.SecurityLevel.BIOMETRIC ||
      (await Auth.authenticateAsync()).success,
    false,
  );

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
  const { requireBiometrics } = useRecoilValue(authSettingsAtom);

  const [auth, setAuth] = useState<AuthState>({ success: !requireBiometrics }); // Use an object to re-render every time setAuth is called; TODO: test if this is still necessary

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
