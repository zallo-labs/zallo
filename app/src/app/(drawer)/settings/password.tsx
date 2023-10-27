import { useMemo } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useImmerAtom } from 'jotai-immer';
import { z } from 'zod';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { AUTH_METHODS } from '~/hooks/useAuthenticate';
import { zodResolver } from '@hookform/resolvers/zod';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { Button } from '~/components/Button';
import { makeStyles } from '@theme/makeStyles';
import { FormPasswordField } from '~/components/fields/FormPasswordField';
import { hashPassword } from '~/lib/hashPassword';
import { showSuccess } from '~/components/provider/SnackbarProvider';

const getSchema = (currentHash: string | null) =>
  z
    .object({
      ...(currentHash && {
        current: z.string().refine((p) => hashPassword(p) === currentHash, {
          message: 'Must match current password',
        }),
      }),
      password: z.string().min(1, { message: 'Must be at least 1 character' }),
      confirm: z.string(),
    })
    .refine((inputs) => inputs.password === inputs.confirm, {
      message: 'Passwords must match',
      path: ['confirm'],
    });

interface Inputs {
  current?: string;
  password: string;
  confirm: string;
}

export default function PasswordScreen() {
  const styles = useStyles();
  const [{ passwordHash }, update] = useImmerAtom(AUTH_METHODS);

  const { control, handleSubmit, watch, reset } = useForm<Inputs>({
    mode: 'onBlur',
    defaultValues: { password: '', confirm: '' },
    resolver: zodResolver(useMemo(() => getSchema(passwordHash), [passwordHash])),
  });

  const currentPassword = watch('current');
  const isPasswordConfirmed = useMemo(
    () => currentPassword && hashPassword(currentPassword) === passwordHash,
    [currentPassword, passwordHash],
  );

  return (
    <>
      <AppbarOptions mode="large" headline="Password" />

      <ScreenSurface>
        <View style={styles.fields}>
          {passwordHash && (
            <FormPasswordField
              label="Current password"
              required
              control={control}
              name="current"
              containerStyle={styles.current}
              autoComplete="current-password"
            />
          )}

          <FormPasswordField
            label="New password"
            required
            control={control}
            name="password"
            autoComplete="new-password"
          />

          <FormPasswordField
            label="Re-enter new password"
            required
            control={control}
            name="confirm"
            autoComplete="new-password"
          />
        </View>

        <Actions>
          {passwordHash && (
            <Button mode="text" disabled={!isPasswordConfirmed} labelStyle={styles.removeLabel}>
              Remove
            </Button>
          )}
          <FormSubmitButton
            mode="contained"
            control={control}
            onPress={handleSubmit(({ password }) => {
              update((v) => {
                v.passwordHash = hashPassword(password);
              });
              showSuccess(`Password ${passwordHash ? 'updated' : 'created'}`);
              reset();
            })}
          >
            {passwordHash ? 'Update' : 'Create'}
          </FormSubmitButton>
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
    color: colors.error,
  },
}));
