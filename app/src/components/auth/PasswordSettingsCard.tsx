import { useMemo, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { showInfo } from '#/provider/SnackbarProvider';
import { hashPassword, verifyPassword } from '~/lib/crypto/password';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtom, useAtomValue } from 'jotai';
import { FormTextField } from '#/fields/FormTextField';
import { changeSecureStorePassword } from '~/lib/secure-storage';
import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { PasswordIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { Button } from '#/Button';
import Collapsible from 'react-native-collapsible';
import { Actions } from '#/layout/Actions';
import { Card } from '#/layout/Card';

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

export interface PasswordSettingsCardProps {
  style?: StyleProp<ViewStyle>;
}

export function PasswordSettingsCard({ style }: PasswordSettingsCardProps) {
  const { styles } = useStyles(stylesheet);
  const [passwordHash, updateHash] = useAtom(PASSWORD_HASH);

  const [expanded, setExpanded] = useState(false);

  const { control, handleSubmit, watch, reset } = useForm<Inputs>({
    mode: 'onBlur',
    defaultValues: { password: '', confirm: '' },
    resolver: zodResolver(useMemo(() => getSchema(passwordHash), [passwordHash])),
  });
  const newPassword = !!watch('password');

  const update = async (password: string | null) => {
    updateHash(password && (await hashPassword(password)));
    changeSecureStorePassword(password || undefined);
  };

  return (
    <Card type="outlined" style={[styles.card, style]}>
      <View style={styles.header}>
        <PasswordIcon size={ICON_SIZE.medium} />

        <Text variant="titleMedium" style={styles.headline}>
          Password
        </Text>

        {!expanded ? (
          <Button mode="text" onPress={() => setExpanded(true)}>
            {passwordHash ? 'Configure' : 'Setup'}
          </Button>
        ) : (
          <Button
            mode="text"
            labelStyle={styles.discard}
            onPress={() => {
              setExpanded(false);
            }}
          >
            Discard
          </Button>
        )}
      </View>

      <Collapsible collapsed={!expanded} style={styles.fields}>
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

        <View style={styles.newPasswords}>
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

        <Actions horizontal>
          {newPassword || !passwordHash ? (
            <FormSubmitButton
              mode="contained"
              control={control}
              onPress={handleSubmit(async ({ password }) => {
                update(password);
                showInfo(`Password ${passwordHash ? 'updated' : 'created'}`, {
                  visibilityTime: 2000,
                });
                reset();
                setExpanded(false);
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
                setExpanded(false);
              })}
              contentStyle={styles.removeContainer}
              labelStyle={styles.removeLabel}
            >
              Remove
            </FormSubmitButton>
          )}
        </Actions>
      </Collapsible>
    </Card>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headline: {
    flex: 1,
  },
  discard: {
    color: colors.error,
  },
  fields: {
    paddingTop: 16,
    gap: 16,
  },
  current: {
    marginBottom: 16,
  },
  newPasswords: {
    gap: 8,
  },
  removeContainer: {
    backgroundColor: colors.errorContainer,
  },
  removeLabel: {
    color: colors.onErrorContainer,
  },
}));
