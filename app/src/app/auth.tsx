import { FingerprintIcon, ZalloIconMinimal } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { Subject } from 'rxjs';
import useAsyncEffect from 'use-async-effect';
import { usePasswordHash } from '#/auth/PasswordSettingsCard';
import { Button } from '#/Button';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { withSuspense } from '#/skeleton/withSuspense';
import { useBiometrics } from '~/hooks/useBiometrics';
import { useGetEvent } from '~/hooks/useGetEvent';
import { verifyPassword } from '~/lib/crypto/password';
import { secureStorageLocked } from '~/lib/secure-storage';
import { View } from 'react-native';
import { ICON_SIZE } from '@theme/paper';
import { Splash } from '../components/Splash';
import { useEffect } from 'react';

const UNLOCKED = new Subject<true>();
const emitAuth = () => UNLOCKED.next(true);

export function useAuthenticate() {
  const getEvent = useGetEvent();
  return () => getEvent(`/auth`, UNLOCKED);
}

interface Inputs {
  password: string;
}

export interface AuthenticateScreenProps {
  onAuth?: (password?: string) => void;
}

function AuthenticateScreen({ onAuth = emitAuth }: AuthenticateScreenProps) {
  const { styles } = useStyles(stylesheet);
  const biometrics = useBiometrics();
  const passwordHash = usePasswordHash();

  const { control, handleSubmit, reset } = useForm<Inputs>({ defaultValues: { password: '' } });

  // Automatically auth if none are available
  const available = biometrics.enabled || !!passwordHash;
  useEffect(() => {
    if (!available) onAuth();
  }, [available, onAuth]);

  // Try biometrics first if available
  useAsyncEffect(
    async (isMounted) => {
      if (!secureStorageLocked()) {
        const success = await biometrics.auth?.();
        if (isMounted() && success) onAuth();
      }
    },
    [biometrics.auth, onAuth],
  );

  const onPasswordAuth = handleSubmit(({ password }) => {
    onAuth(password);
    reset();
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ZalloIconMinimal size={ICON_SIZE.extraLarge} style={styles.center} />

        <Text variant="headlineMedium" style={[styles.title, styles.center]}>
          Welcome back
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
              validate: async (p) =>
                (await verifyPassword(p, passwordHash)) || 'Incorrect password',
            }}
            onChangeText={async (p) => {
              if (await verifyPassword(p, passwordHash)) onPasswordAuth();
            }}
          />
        )}

        <Actions flex={false}>
          {passwordHash && (
            <Button mode="contained" onPress={onPasswordAuth}>
              Unlock
            </Button>
          )}

          {biometrics.auth && !secureStorageLocked() && (
            <Button
              icon={FingerprintIcon}
              mode="contained-tonal"
              onPress={async () => {
                if (await biometrics.auth?.()) onAuth();
              }}
            >
              Biometrics
            </Button>
          )}

          {/* <Button mode="text">Forgot password</Button> */}
        </Actions>
      </View>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 20,
    paddingHorizontal: 16,
  },
  center: {
    alignSelf: 'center',
  },
  title: {
    marginTop: 8,
    marginBottom: 16,
  },
  password: {
    marginHorizontal: 16,
  },
  actions: {
    marginHorizontal: 0,
  },
}));

export default withSuspense(AuthenticateScreen, <Splash />);

export { ErrorBoundary } from '#/ErrorBoundary';
