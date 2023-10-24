import { StyleSheet } from 'react-native';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { ListItem } from '~/components/list/ListItem';
import { LockOpenIcon, TransferIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { atom, useAtomValue } from 'jotai';
import { AUTH_SETTINGS_ATOM, SUPPORTS_BIOMETRICS } from '~/components/provider/AuthGate';
import { ReactNode, useEffect } from 'react';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';

const biometricsAvailableAtom = atom(SUPPORTS_BIOMETRICS);

export interface AuthSettingsProps {
  actions?: ReactNode;
  appbarMenu?: boolean;
}

function AuthSettings_({ actions, appbarMenu }: AuthSettingsProps) {
  const hasSupport = useAtomValue(biometricsAvailableAtom);

  const [settings, updateSettings] = useImmerAtom(AUTH_SETTINGS_ATOM);

  // Enable on 'open' (if supported) when this screen is first opened
  useEffect(() => {
    if (settings.open === null) updateSettings((s) => ({ ...s, open: hasSupport }));
  }, [hasSupport, settings.open, updateSettings]);

  return (
    <>
      <AppbarOptions
        mode="large"
        {...(appbarMenu && { leading: AppbarMenu })}
        headline="Authentication"
      />

      <ScreenSurface style={styles.surface}>
        <ListHeader>Require biometrics when</ListHeader>

        <ListItem
          leading={LockOpenIcon}
          headline="Opening the app"
          trailing={({ disabled }) => (
            <Switch
              value={hasSupport && (settings.open ?? true)}
              onValueChange={() => updateSettings((s) => ({ ...s, open: !s.open }))}
              disabled={disabled}
            />
          )}
          disabled={!hasSupport}
        />

        <ListItem
          leading={TransferIcon}
          headline="Approving a proposal"
          trailing={({ disabled }) => (
            <Switch
              value={hasSupport && settings.approval}
              onValueChange={() => updateSettings((s) => ({ ...s, approval: !s.approval }))}
              disabled={disabled}
            />
          )}
          disabled={!hasSupport}
        />

        <Actions>{actions}</Actions>
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  surface: {
    paddingTop: 8,
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
