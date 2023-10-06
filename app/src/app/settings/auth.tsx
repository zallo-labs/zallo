import { useLocalSearchParams, useRouter } from 'expo-router';
import { ICON_SIZE } from '@theme/paper';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { ListItem } from '~/components/list/ListItem';
import { FingerprintIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { atom, useAtomValue } from 'jotai';
import { AUTH_SETTINGS_ATOM, SUPPORTS_BIOMETRICS } from '~/provider/AuthGate';
import { useEffect } from 'react';

const biometricsAvailableAtom = atom(SUPPORTS_BIOMETRICS);

export type AuthSettingsScreenRoute = `/settings/auth`;
export type AuthSettingsScreenParams = { onboard?: 'true' };

export default function AuthSettingsScreen() {
  const router = useRouter();
  const onboard = useLocalSearchParams<AuthSettingsScreenParams>().onboard === 'true';
  const hasSupport = useAtomValue(biometricsAvailableAtom);

  const [settings, updateSettings] = useImmerAtom(AUTH_SETTINGS_ATOM);

  // Enable on 'open' (if supported) when this screen is first opened
  useEffect(() => {
    if (settings.open === null) updateSettings((s) => ({ ...s, open: hasSupport }));
  }, [hasSupport, settings.open, updateSettings]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <FingerprintIcon size={ICON_SIZE.medium} />

        <Text variant="headlineMedium" style={styles.text}>
          Authentication
        </Text>
      </View>

      <View>
        <ListHeader>Require biometrics when</ListHeader>

        <ListItem
          leading={(props) => <FingerprintIcon {...props} size={ICON_SIZE.medium} />}
          headline="Opening the app"
          trailing={({ disabled }) => (
            <Switch
              value={settings.open ?? true}
              onValueChange={() => updateSettings((s) => ({ ...s, open: !s.open }))}
              disabled={disabled}
            />
          )}
          disabled={!hasSupport}
        />

        <ListItem
          leading={(props) => <FingerprintIcon {...props} size={ICON_SIZE.medium} />}
          headline="Approving a proposal"
          trailing={({ disabled }) => (
            <Switch
              value={settings.approval}
              onValueChange={() => updateSettings((s) => ({ ...s, approval: !s.approval }))}
              disabled={disabled}
            />
          )}
          disabled={!hasSupport}
        />
      </View>

      <Actions>
        {onboard && (
          <Button
            mode="contained"
            onPress={async () => {
              router.push({
                pathname: `/settings/notifications`,
                params: { onboard: 'true' },
              });
            }}
          >
            Continue
          </Button>
        )}
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
