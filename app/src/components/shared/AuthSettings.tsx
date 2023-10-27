import { ScrollView, StyleSheet } from 'react-native';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { ListItem } from '~/components/list/ListItem';
import { FingerprintIcon, LockOpenIcon, PasswordIcon, TransferIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { useAtomValue } from 'jotai';
import { ReactNode, useEffect } from 'react';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { Button } from '~/components/Button';
import { AUTH_METHODS, AUTH_SETTINGS, BIOMETRICS_AVAILABLE } from '~/hooks/useAuthenticate';
import { Href, useRouter } from 'expo-router';

export interface AuthSettingsProps {
  actions?: ReactNode;
  appbarMenu?: boolean;
  passwordHref: Href<`/`>;
}

function AuthSettings_({ actions, appbarMenu, passwordHref }: AuthSettingsProps) {
  const router = useRouter();
  const biometicsAvailable = useAtomValue(BIOMETRICS_AVAILABLE);

  const [methods, updateMethods] = useImmerAtom(AUTH_METHODS);
  const [settings, updateSettings] = useImmerAtom(AUTH_SETTINGS);

  // Enable biometrics (if supported) when this screen is first opened
  useEffect(() => {
    if (methods.biometrics === null)
      updateMethods((s) => {
        s.biometrics = true;
      });
  }, [biometicsAvailable, methods.biometrics, updateMethods]);

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
                {methods.passwordHash ? 'Configure' : 'Create'}
              </Button>
            )}
          />

          <ListItem
            leading={FingerprintIcon}
            headline="Biometrics"
            trailing={({ disabled }) => (
              <Switch
                value={biometicsAvailable && !!methods.biometrics}
                onValueChange={(v) => updateMethods((s) => ({ ...s, biometics: v }))}
                disabled={disabled}
              />
            )}
            disabled={!biometicsAvailable}
          />

          <ListHeader>Required</ListHeader>

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
  header: {
    alignItems: 'center',
    gap: 4,
    marginVertical: 32,
    marginHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    marginBottom: 8,
  },
});

export const AuthSettings = withSuspense(AuthSettings_, <ScreenSkeleton />);
