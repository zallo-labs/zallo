import { useImmerAtom } from 'jotai-immer';
import { Divider, Switch, Text } from 'react-native-paper';
import { ListItem } from '#/list/ListItem';
import { FingerprintIcon, LockOpenIcon, OutboundIcon } from '@theme/icons';
import { useBiometrics } from '~/hooks/useBiometrics';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtomValue } from 'jotai';
import { SECURE_STORE_PASSWORD_ENCRYPTED as ALWAYS_REQUIRED_ON_OPEN } from '~/lib/secure-storage';
import { createStyles } from '@theme/styles';
import { PasswordSettings, usePasswordHash } from './PasswordSettings';
import { StyleProp, View, ViewStyle } from 'react-native';
import _ from 'lodash';

// Security note: this has weak security guarantees as an attacker with local access may change these settings, or even the whole JS bundle...
const AUTH_SETTINGS = persistedAtom('AuthenticationSettings', {
  open: false,
  approval: true,
});

export function useAuthSettings() {
  const available = useAuthAvailable();

  return _.mapValues(useAtomValue(AUTH_SETTINGS), (v) => v && available);
}

function useAuthAvailable() {
  const biometrics = useBiometrics();
  const passwordHash = usePasswordHash();

  return biometrics.available || !!passwordHash;
}

export interface AuthSettingsProps {
  style?: StyleProp<ViewStyle>;
}

export function AuthSettings({ style }: AuthSettingsProps) {
  const biometrics = useBiometrics();
  const available = useAuthAvailable();
  const unlockDisabled = !available || ALWAYS_REQUIRED_ON_OPEN;

  const settings = useAuthSettings();
  const [, updateSettings] = useImmerAtom(AUTH_SETTINGS);

  return (
    <View style={style}>
      <PasswordSettings style={styles.indent} />
      <Divider style={[styles.divider, styles.indent]} />

      {biometrics.available && (
        <ListItem
          leading={FingerprintIcon}
          headline="Biometrics"
          supporting="Allow biometrics to be used"
          trailing={
            <Switch value={biometrics.enabled} onValueChange={(v) => biometrics.setEnabled(v)} />
          }
        />
      )}

      <Text variant="labelLarge" style={[styles.indent, styles.label]}>
        Required to
      </Text>

      <ListItem
        leading={LockOpenIcon}
        headline="Unlock app"
        trailing={() => (
          <Switch
            value={settings.open}
            onValueChange={(v) => updateSettings((s) => ({ ...s, open: v }))}
            disabled={unlockDisabled}
          />
        )}
        disabled={unlockDisabled}
      />

      <ListItem
        leading={OutboundIcon}
        headline="Approve action"
        trailing={() => (
          <Switch
            value={settings.approval}
            onValueChange={(v) => updateSettings((s) => ({ ...s, approval: v }))}
            disabled={!available}
          />
        )}
        disabled={!available}
      />
    </View>
  );
}

const styles = createStyles({
  divider: {
    marginTop: 16,
    marginBottom: 8,
  },
  indent: {
    marginHorizontal: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
});
