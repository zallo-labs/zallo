import { Platform } from 'react-native';
import * as Auth from 'expo-local-authentication';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import { persistedAtom } from '~/lib/persistedAtom';

const BIOMETRICS_ENABLED = persistedAtom<boolean | null>('biometrics', null);

const BIOMETRICS_AVAILABLE = atom(Platform.select({ native: Auth.isEnrolledAsync() }));

export function useBiometrics() {
  const available = !!useAtomValue(BIOMETRICS_AVAILABLE);
  const enabled = useAtomValue(BIOMETRICS_ENABLED) && available;

  return {
    available,
    enabled,
    setEnabled: useSetAtom(BIOMETRICS_ENABLED),
    auth: enabled
      ? async (options?: Auth.LocalAuthenticationOptions) =>
          (await Auth.authenticateAsync(options)).success
      : undefined,
  };
}
