import { FingerprintIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { Subject } from 'rxjs';
import useAsyncEffect from 'use-async-effect';
import { usePasswordHash } from '~/app/(drawer)/settings/password';
import { Button } from '~/components/Button';
import { DialogModal } from '~/components/Dialog/DialogModal';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useBiometrics } from '~/hooks/useBiometrics';
import { useGetEvent } from '~/hooks/useGetEvent';
import { useHashPassword } from '~/hooks/useHashPassword';
import { unlockSecureStorage } from '~/lib/secure-storage';

export const UNLOCKED = new Subject<true>();
const onUnlockDefault = () => UNLOCKED.next(true);

export function useAuthenticate() {
  const getEvent = useGetEvent();
  return () => getEvent(`/auth`, UNLOCKED);
}

export function useAuthAvailable() {
  const biometrics = useBiometrics();
  const passwordHash = usePasswordHash();

  return biometrics.enabled || !!passwordHash;
}

interface Inputs {
  password: string;
}

export interface AuthenticateScreenProps {
  onUnlock?: () => void;
}

function AuthenticateScreen({ onUnlock: unlock = onUnlockDefault }: AuthenticateScreenProps) {
  const styles = useStyles();
  const { auth: biometricsAuth } = useBiometrics();
  const passwordHash = usePasswordHash();
  const hash = useHashPassword();
  const available = useAuthAvailable();

  const [show, setShow] = useState(available && !biometricsAuth);
  const { control, handleSubmit } = useForm<Inputs>({ defaultValues: { password: '' } });

  // Unlock immediately if no auth methods are available
  useEffect(() => {
    if (!available) unlock();
  }, [available, unlock]);

  // Try biometrics first if available
  useAsyncEffect(
    async (isMounted) => {
      const success = await biometricsAuth?.();
      if (isMounted()) success ? unlock() : setShow(true);
    },
    [biometricsAuth, unlock],
  );

  const unlockWithPassword = handleSubmit(({ password }) => {
    if (password) unlockSecureStorage(password);
    unlock();
  });

  if (!show) return null;

  return (
    <DialogModal dismissable={false}>
      <Text variant="titleMedium" style={styles.title}>
        Unlock to continue
      </Text>

      {passwordHash && (
        <FormTextField
          label="Password"
          required
          control={control}
          name="password"
          textStyle={styles.password}
          autoComplete="current-password"
          secureTextEntry
          rules={{
            validate: async (p) => (await hash(p)) === passwordHash || 'Incorrect password',
          }}
          onChangeText={async (p) => {
            if ((await hash(p)) === passwordHash) unlockWithPassword();
          }}
        />
      )}

      <Actions flex={false}>
        {biometricsAuth && (
          <Button
            icon={FingerprintIcon}
            mode="contained-tonal"
            labelStyle={styles.buttonLabel}
            onPress={async () => {
              if (await biometricsAuth()) unlock();
            }}
          >
            Biometrics
          </Button>
        )}

        {passwordHash && (
          <Button mode="contained" labelStyle={styles.buttonLabel} onPress={unlockWithPassword}>
            Unlock
          </Button>
        )}
      </Actions>
    </DialogModal>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  title: {
    color: colors.onSurfaceVariant,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  password: {
    marginHorizontal: 16,
    backgroundColor: colors.elevation.level3,
  },
  buttonLabel: {
    flexShrink: 0,
  },
}));

export default withSuspense(AuthenticateScreen, null);
