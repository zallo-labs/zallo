import { ReactNode, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';

import { usePasswordHash } from '~/app/(drawer)/settings/password';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useBiometrics } from '~/hooks/useBiometrics';
import { persistedAtom } from '~/lib/persistedAtom';
import { SECURE_STORE_PASSWORD_ENCRYPTED as ALWAYS_REQUIRED_ON_OPEN } from '~/lib/secure-storage';
import { FingerprintIcon, LockOpenIcon, PasswordIcon, TransferIcon } from '~/util/theme/icons';

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
  const router = useRouter();
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

      <ScreenSurface style={styles.surface}>
        <ScrollView contentContainerStyle={styles.container}>
          <ListHeader>Methods</ListHeader>

          <ListItem
            leading={PasswordIcon}
            headline="Password"
            trailing={() => (
              <Button mode="contained" onPress={() => router.push(passwordHref)}>
                {passwordConfigured ? 'Configure' : 'Create'}
              </Button>
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
      </ScreenSurface>
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
