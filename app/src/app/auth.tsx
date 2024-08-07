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
import { Platform, View } from 'react-native';
import { ICON_SIZE } from '@theme/paper';
import { Splash } from '../components/Splash';
import { useEffect, useState } from 'react';
import { ConfirmModal } from './(modal)/confirm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

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

  const [eraseModal, setEraseModal] = useState(false);

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
      <View style={styles.spacer} />

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
        </Actions>
      </View>

      <View style={styles.resetContainer}>
        <Text variant="bodyLarge" style={styles.resetText}>
          Forgot password?{'\n'}
          You can erase all data from this device.
        </Text>

        <Button mode="text" onPress={() => setEraseModal(true)}>
          Erase data
        </Button>
      </View>

      {eraseModal && (
        <ConfirmModal
          type="destructive"
          title="Erase all data from this device?"
          message={`This will erase all data from this device. THIS CAN NOT BE UNDONE!\n\nOnce erased, you can re-gain access to your account(s) using other approvers connected to that account`}
          confirmLabel="Erase all data"
          onDismiss={() => setEraseModal(false)}
          onConfirmation={async (confirmed) => {
            if (!confirmed) return setEraseModal(false);

            await AsyncStorage.clear();
            if (Platform.OS === 'web') {
              window.location.replace('/');
            } /* iOS | Android */ else if (!__DEV__) {
              Updates.reloadAsync();
            } else {
              alert('Data erased. Please reload the app to continue');
            }
          }}
        />
      )}
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  spacer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
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
  resetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 16,
  },
  resetText: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
}));

export default withSuspense(AuthenticateScreen, <Splash />);

export { ErrorBoundary } from '#/ErrorBoundary';
