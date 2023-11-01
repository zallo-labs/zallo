import { useMemo } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { zodResolver } from '@hookform/resolvers/zod';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { makeStyles } from '@theme/makeStyles';
import { showInfo } from '~/components/provider/SnackbarProvider';
import { hashPassword, verifyPassword } from '~/lib/crypto/password';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtom, useAtomValue } from 'jotai';
import { FormTextField } from '~/components/fields/FormTextField';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { changeSecureStorePassword } from '~/lib/secure-storage';

const PASSWORD_HASH = persistedAtom<string | null>('passwordHash', null, {
  skipInitialPersist: true,
});
export const usePasswordHash = () => useAtomValue(PASSWORD_HASH);

const getSchema = (expectedHash: string | null) =>
  z
    .object(
      expectedHash
        ? {
            current: z.string().refine(async (p) => await verifyPassword(p, expectedHash), {
              message: 'Must match current password',
            }),
            password: z.string().optional(),
            confirm: z.string().optional(),
          }
        : {
            password: z.string().min(1, 'Must be at least 1 character'),
            confirm: z.string(),
          },
    )
    .refine((inputs) => inputs.password === inputs.confirm, {
      message: 'Passwords must match',
      path: ['confirm'],
    });

interface Inputs {
  current?: string;
  password: string;
  confirm: string;
}

function PasswordScreen() {
  const styles = useStyles();
  const [passwordHash, update] = useAtom(PASSWORD_HASH);

  const { control, handleSubmit, watch, reset } = useForm<Inputs>({
    mode: 'onBlur',
    defaultValues: { password: '', confirm: '' },
    resolver: zodResolver(useMemo(() => getSchema(passwordHash), [passwordHash])),
  });

  const newPassword = !!watch('password');

  return (
    <>
      <AppbarOptions mode="large" headline="Password" />

      <ScreenSurface>
        <View style={styles.fields}>
          {passwordHash && (
            <FormTextField
              label="Current password"
              required
              control={control}
              name="current"
              containerStyle={styles.current}
              secureTextEntry
              autoComplete="current-password"
            />
          )}

          <FormTextField
            label="New password"
            control={control}
            name="password"
            secureTextEntry
            autoComplete="new-password"
          />

          <FormTextField
            label="Re-enter new password"
            required={newPassword}
            control={control}
            name="confirm"
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <Actions>
          {newPassword || !passwordHash ? (
            <FormSubmitButton
              mode="contained"
              control={control}
              onPress={handleSubmit(async ({ password }) => {
                update(await hashPassword(password));
                changeSecureStorePassword(password);
                showInfo(`Password ${passwordHash ? 'updated' : 'created'}`, {
                  visibilityTime: 2000,
                });
                reset();
              })}
            >
              {passwordHash ? 'Update' : 'Create'}
            </FormSubmitButton>
          ) : (
            <FormSubmitButton
              mode="contained"
              control={control}
              onPress={handleSubmit(() => {
                update(null);
                showInfo(`Password removed`, { visibilityTime: 2000 });
                reset();
              })}
              contentStyle={styles.removeContainer}
              labelStyle={styles.removeLabel}
            >
              Remove
            </FormSubmitButton>
          )}
        </Actions>
      </ScreenSurface>
    </>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  fields: {
    margin: 16,
    gap: 16,
  },
  current: {
    marginBottom: 16,
  },
  removeContainer: {
    backgroundColor: colors.errorContainer,
  },
  removeLabel: {
    color: colors.onErrorContainer,
  },
}));

export default withSuspense(PasswordScreen, ScreenSkeleton);
