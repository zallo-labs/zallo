import { useImmerAtom } from 'jotai-immer';
import { Switch, Text } from 'react-native-paper';
import { ListItem } from '#/list/ListItem';
import { FingerprintIcon, LockOpenIcon, OutboundIcon } from '@theme/icons';
import { useEffect } from 'react';
import { useBiometrics } from '~/hooks/useBiometrics';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtomValue } from 'jotai';
import { SECURE_STORE_PASSWORD_ENCRYPTED as ALWAYS_REQUIRED_ON_OPEN } from '~/lib/secure-storage';
import { createStyles } from '@theme/styles';
import { ICON_SIZE } from '@theme/paper';
import { PasswordSettingsCard } from './PasswordSettingsCard';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Card } from '#/layout/Card';

// Security note: this has weak security guarantees as an attacker with local access may change these settings, or even the whole JS bundle...
const AUTH_SETTINGS = persistedAtom('AuthenticationSettings', {
  open: true,
  approval: true,
});
export const useAuthRequiredOnOpen = () =>
  useAtomValue(AUTH_SETTINGS).open || ALWAYS_REQUIRED_ON_OPEN;
export const useAuthRequiredOnApproval = () => useAtomValue(AUTH_SETTINGS).approval;

export interface AuthSettings2Props {
  style?: StyleProp<ViewStyle>;
}

export function AuthSettings({ style }: AuthSettings2Props) {
  const biometrics = useBiometrics();

  const [settings, updateSettings] = useImmerAtom(AUTH_SETTINGS);

  // Enable biometrics (if supported) when this screen is first opened
  useEffect(() => {
    biometrics.setEnabled((enabled) => (enabled === null ? biometrics.available : enabled));
  }, [biometrics]);

  return (
    <View style={[styles.container, style]}>
      {biometrics.available && (
        <Card type="outlined" style={[styles.indent, styles.biometrics]}>
          <FingerprintIcon size={ICON_SIZE.medium} />

          <Text variant="titleMedium" style={styles.cardHeadline}>
            Biometrics
          </Text>

          <Switch value={!!biometrics.enabled} onValueChange={(v) => biometrics.setEnabled(v)} />
        </Card>
      )}

      <PasswordSettingsCard style={styles.indent} />

      <View>
        <Text variant="titleMedium" style={[styles.indent, styles.authOnHeader]}>
          Authenticate on
        </Text>

        <ListItem
          leading={LockOpenIcon}
          headline="Unlock app"
          trailing={() => (
            <Switch
              value={!ALWAYS_REQUIRED_ON_OPEN && settings.open}
              onValueChange={(v) => updateSettings((s) => ({ ...s, open: v }))}
            />
          )}
          disabled={ALWAYS_REQUIRED_ON_OPEN}
        />

        <ListItem
          leading={OutboundIcon}
          headline="Approve action"
          trailing={() => (
            <Switch
              value={settings.approval}
              onValueChange={(v) => updateSettings((s) => ({ ...s, approval: v }))}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = createStyles({
  container: {
    gap: 8,
  },
  indent: {
    marginHorizontal: 16,
  },
  biometrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  cardHeadline: {
    flex: 1,
  },
  authOnHeader: {
    marginVertical: 8,
  },
});
