import { persistedAtom } from '~/lib/persistedAtom';
import * as Auth from 'expo-local-authentication';
import { Platform } from 'react-native';
import { atom, useAtomValue } from 'jotai';
import { useCallback } from 'react';

export const AUTH_METHODS = persistedAtom('AuthMethods', {
  biometrics: null as boolean | null,
  passwordHash: null as string | null,
});

export const AUTH_SETTINGS = persistedAtom('AuthenticationSettings', {
  open: true,
  approval: true,
});

export const BIOMETRICS_AVAILABLE = atom(Platform.select({ native: Auth.isEnrolledAsync() }));

export interface AuthOptions {
  retry?: boolean;
  promptMessage?: string;
}

export function useAuthenticate() {
  const { biometrics, passwordHash } = useAtomValue(AUTH_METHODS);
  const biometricsAvailable = useAtomValue(BIOMETRICS_AVAILABLE);

  const auth = useCallback(
    async (opts: AuthOptions = {}) => {
      const { retry, promptMessage } = opts;
      const attempt = async () => {
        if (biometrics && biometricsAvailable) {
          return (await Auth.authenticateAsync({ ...(promptMessage && { promptMessage }) }))
            .success;
        }

        if (passwordHash) {
          // TODO: verify password and unlock secure storage
        }

        return true;
      };

      const success = await attempt();
      if (!success && retry) return auth(opts);

      return success;
    },
    [biometrics, passwordHash],
  );

  return auth;
}
