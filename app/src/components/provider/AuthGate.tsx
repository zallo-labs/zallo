import { ReactNode, useCallback, useEffect, useState } from 'react';
import { DateTime, Duration } from 'luxon';
import { AppState } from 'react-native';
import { lockSecureStorage, unlockSecureStorage } from '~/lib/secure-storage';
import AuthenticateScreen from '~/app/(modal)/auth';
import { Blur } from '~/components/Blur';
import { useAuthRequiredOnOpen } from '~/components/shared/AuthSettings';

const TIMEOUT_AFTER = Duration.fromObject({ minutes: 5 }).toMillis();

interface AuthState {
  success?: boolean;
  lastAuthenticated?: DateTime;
}

export interface AuthGateProps {
  children: ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  const required = useAuthRequiredOnOpen();

  const [state, setState] = useState<AuthState>({ success: !required });
  const onAuth = useCallback((password?: string) => {
    setState((s) => ({ ...s, success: true }));
    unlockSecureStorage(password);
  }, []);

  // Unauthenticate if app had left foreground
  useEffect(() => {
    if (!required) return;

    const listener = AppState.addEventListener('change', (newState) => {
      if (newState === 'active') {
        setState((prev) =>
          prev.lastAuthenticated
            ? { success: DateTime.now().diff(prev.lastAuthenticated).toMillis() < TIMEOUT_AFTER }
            : prev,
        );
      } else if (newState === 'background') {
        setState((prev) => (prev.success ? { ...prev, lastAuthenticated: DateTime.now() } : prev));
      }
    });

    return () => listener.remove();
  }, [required, setState]);

  useEffect(() => {
    if (!state.success) lockSecureStorage();
  }, [state.success]);

  return (
    <>
      {children}

      {!state.success && <AuthenticateScreen onAuth={onAuth} container={Blur} />}
    </>
  );
};
