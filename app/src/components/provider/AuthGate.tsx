import { ReactNode, useEffect, useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { DateTime, Duration } from 'luxon';
import { Blur } from '~/components/Blur';
import { AppState } from 'react-native';
import { useAtomValue } from 'jotai';
import { AUTH_SETTINGS, useAuthenticate } from '~/hooks/useAuthenticate';

const TIMEOUT_AFTER = Duration.fromObject({ minutes: 5 }).toMillis();

interface AuthState {
  success?: boolean;
  lastAuthenticated?: DateTime;
}

export interface AuthGateProps {
  children: ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  const authenticate = useAuthenticate();
  const { open: require } = useAtomValue(AUTH_SETTINGS);

  const [state, setState] = useState<AuthState>({ success: !require });

  // Try authenticate
  useAsyncEffect(
    async (isMounted) => {
      if (!state.success) {
        const success = await authenticate({ retry: true });
        if (isMounted() && success) setState({ success });
      }
    },
    [state, setState],
  );

  // Unauthenticate if app had left foreground
  useEffect(() => {
    if (!require) return;

    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') {
        setState((prev) =>
          prev.lastAuthenticated
            ? { success: DateTime.now().diff(prev.lastAuthenticated).toMillis() < TIMEOUT_AFTER }
            : prev,
        );
      } else if (newState === 'background') {
        setState((prev) =>
          prev.success
            ? { ...prev, lastAuthenticated: DateTime.now() }
            : // Re-render to prompt authentication
              {},
        );
      }
    });

    return () => listener.remove();
  }, [require, setState]);

  return (
    <>
      {children}
      {!state.success && <Blur blurAmount={16} />}
    </>
  );
};
