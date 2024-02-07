import { ScrollView, StyleSheet } from 'react-native';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';
import { Actions } from '#/layout/Actions';
import { ListItem } from '#/list/ListItem';
import { FingerprintIcon, LockOpenIcon, PasswordIcon, TransferIcon } from '@theme/icons';
import { ListHeader } from '#/list/ListHeader';
import { ReactNode, useEffect } from 'react';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { AppbarMenu } from '#/Appbar/AppbarMenu';
import { Button } from '#/Button';
import { Href, Link } from 'expo-router';
import { useBiometrics } from '~/hooks/useBiometrics';
import { usePasswordHash } from '~/app/(drawer)/settings/password';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtomValue } from 'jotai';
import { SECURE_STORE_PASSWORD_ENCRYPTED as ALWAYS_REQUIRED_ON_OPEN } from '~/lib/secure-storage';

// Security note: this has weak security guarantees as an attacker with local access may change these settings, or even the whole JS bundle...
const AUTH_SETTINGS = persistedAtom('AuthenticationSettings', {
  open: true,
  approval: true,
});
export const useAuthRequiredOnOpen = () =>
  useAtomValue(AUTH_SETTINGS).open || ALWAYS_REQUIRED_ON_OPEN;
export const useAuthRequiredOnApproval = () => useAtomValue(AUTH_SETTINGS).approval;

export interface AuthSettingsProps {
  actions?: ReactNode;
  appbarMenu?: boolean;
  passwordHref: Href<`/`>;
}

function AuthSettings_({ actions, appbarMenu, passwordHref }: AuthSettingsProps) {
  const biometrics = useBiometrics();
  const passwordConfigured = !!usePasswordHash();

  const [settings, updateSettings] = useImmerAtom(AUTH_SETTINGS);

  // Enable biometrics (if supported) when this screen is first opened
  useEffect(() => {
    biometrics.setEnabled((enabled) => (enabled === null ? biometrics.available : enabled));
  }, [biometrics]);

  return (
    <>
      <AppbarOptions
        mode="large"
        {...(appbarMenu && { leading: AppbarMenu })}
        headline="Authentication"
      />

      <ScrollableScreenSurface style={styles.surface}>
        <ScrollView contentContainerStyle={styles.container}>
          <ListHeader>Methods</ListHeader>

          <ListItem
            leading={PasswordIcon}
            headline="Password"
            trailing={() => (
              <Link href={passwordHref} asChild>
                <Button mode="contained">{passwordConfigured ? 'Configure' : 'Create'}</Button>
              </Link>
            )}
          />

          <ListItem
            leading={FingerprintIcon}
            headline="Biometrics"
            trailing={({ disabled }) => (
              <Switch
                value={!!biometrics.enabled}
                onValueChange={(v) => biometrics.setEnabled(v)}
                disabled={disabled}
              />
            )}
            disabled={!biometrics.available}
          />

          <ListHeader>Required</ListHeader>

          {!ALWAYS_REQUIRED_ON_OPEN && (
            <ListItem
              leading={LockOpenIcon}
              headline="Opening the app"
              trailing={() => (
                <Switch
                  value={settings.open}
                  onValueChange={(v) => updateSettings((s) => ({ ...s, open: v }))}
                />
              )}
            />
          )}

          <ListItem
            leading={TransferIcon}
            headline="Approving a proposal"
            trailing={() => (
              <Switch
                value={settings.approval}
                onValueChange={(v) => updateSettings((s) => ({ ...s, approval: v }))}
              />
            )}
          />

          <Actions>{actions}</Actions>
        </ScrollView>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  surface: {
    paddingTop: 8,
  },
  container: {
    flexGrow: 1,
  },
});

export const AuthSettings = withSuspense(AuthSettings_, <ScreenSkeleton />);
