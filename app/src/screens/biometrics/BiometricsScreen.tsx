import { ICON_SIZE } from '@theme/paper';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useImmerAtom } from 'jotai-immer';
import { Switch } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { ListItem } from '~/components/list/ListItem';
import { materialIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { atom, useAtomValue } from 'jotai';
import { AUTH_SETTINGS_ATOM, SUPPORTS_BIOMETRICS } from '~/provider/AuthGate';
import { useEffect } from 'react';

const supportsBiometricsAtom = atom(SUPPORTS_BIOMETRICS);
export const FingerprintIcon = materialIcon('fingerprint');

export interface BiometricsScreenParams {
  isOnboarding?: boolean;
}

export type BiometricsScreenProps = StackNavigatorScreenProps<'Biometrics'>;

export const BiometricsScreen = withSuspense(({ navigation, route }: BiometricsScreenProps) => {
  const { isOnboarding } = route.params;
  const hasSupport = useAtomValue(supportsBiometricsAtom);

  const [settings, updateSettings] = useImmerAtom(AUTH_SETTINGS_ATOM);

  // Enable on 'open' (if supported) when this screen is first opened
  useEffect(() => {
    if (settings.open === null) updateSettings((s) => ({ ...s, open: hasSupport }));
  }, [settings.open]);

  return (
    <Screen>
      <Appbar mode="small" leading="back" headline="" />

      <View style={styles.header}>
        <FingerprintIcon size={ICON_SIZE.medium} />

        <Text variant="headlineMedium" style={styles.text}>
          Biometrics
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
        {isOnboarding && (
          <Button mode="contained" onPress={async () => {}}>
            Continue
          </Button>
        )}
      </Actions>
    </Screen>
  );
}, ScreenSkeleton);

const styles = StyleSheet.create({
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
