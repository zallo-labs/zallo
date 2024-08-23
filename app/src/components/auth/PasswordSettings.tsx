import { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { hashPassword, verifyPassword } from '~/lib/crypto/password';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtom, useAtomValue } from 'jotai';
import { FormTextField } from '#/fields/FormTextField';
import { changeSecureStorePassword } from '~/lib/secure-storage';
import { createStyles, useStyles } from '@theme/styles';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { showInfo } from '#/Snackbar';

const PASSWORD_HASH = persistedAtom<string | null>('passwordHash', null);
export const usePasswordHash = () => useAtomValue(PASSWORD_HASH);

const getSchema = (expectedHash: string | null) =>
  z
    .object(
      expectedHash
        ? {
            current: z.string().refine(async (p) => await verifyPassword(p, expectedHash), {
              message: 'Must match current password',
            }),
            new_: z.string().optional(),
            confirm: z.string().optional(),
          }
        : {
            new_: z.string().min(1, 'Must be at least 1 character'),
            confirm: z.string(),
          },
    )
    .refine((inputs) => inputs.new_ === inputs.confirm, {
      message: 'Passwords must match',
      path: ['confirm'],
    });

interface Inputs {
  current?: string;
  new_?: string;
  confirm?: string;
}

export interface PasswordSettingsProps {
  style?: StyleProp<ViewStyle>;
}

export function PasswordSettings({ style }: PasswordSettingsProps) {
  const { styles } = useStyles(stylesheet);
  const [passwordHash, updateHash] = useAtom(PASSWORD_HASH);

  const { control, reset, handleSubmit } = useForm<Inputs>({
    mode: 'onBlur',
    resolver: zodResolver(getSchema(passwordHash)),
  });
  const { current, new_, confirm } = useWatch({ control });

  const submit = handleSubmit(async ({ new_: password }) => {
    const newHash = password ? await hashPassword(password) : null;
    await changeSecureStorePassword(password);
    updateHash(newHash);
    showInfo('Password changed');
    reset();
  });

  useEffect(() => {
    if (new_ && new_ === confirm) submit();
  }, [confirm, new_, submit]);

  return (
    <View style={[styles.container, style]}>
      {passwordHash !== null && (
        <FormTextField
          label="Current password"
          control={control}
          name="current"
          secureTextEntry
          autoComplete="current-password"
        />
      )}

      {(!passwordHash || current) && (
        <>
          <FormTextField
            label="New password"
            control={control}
            name="new_"
            secureTextEntry
            autoComplete="new-password"
          />

          <FormTextField
            label="Confirm new password"
            control={control}
            name="confirm"
            secureTextEntry
            autoComplete="current-password" // Ensures password manager has the correct password
            required={!!new_}
            containerStyle={!new_ && styles.hidden} // Password manager won't autofill hidden fields
          />

          {passwordHash !== null && !new_ && (
            <Actions horizontal style={styles.actions}>
              <Button
                mode="contained"
                contentStyle={styles.removeContainer}
                labelStyle={styles.removeLabel}
                onPress={submit}
              >
                Remove
              </Button>
            </Actions>
          )}
        </>
      )}
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    gap: 16,
  },
  hidden: {
    display: 'none',
  },
  actions: {
    paddingVertical: 0,
  },
  removeContainer: {
    backgroundColor: colors.errorContainer,
  },
  removeLabel: {
    color: colors.onErrorContainer,
  },
}));
