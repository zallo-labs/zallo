import { materialIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { atom, useAtomValue } from 'jotai';
import { Switch } from 'react-native-paper';
import { ListItem } from '~/components/list/ListItem';
import { AUTH_SETTINGS_ATOM } from '~/provider/AuthGate';
import * as Auth from 'expo-local-authentication';
import { useEffect } from 'react';
import { useImmerAtom } from 'jotai-immer';

const supportsBiometricsSelector = atom({
  key: 'SupportsBiometrics',
  get: async () => (await Auth.getEnrolledLevelAsync()) === Auth.SecurityLevel.BIOMETRIC,
});

const FingerprintIcon = materialIcon('fingerprint');

export const RequireBiometricsItem = () => {
  const [{ require }, setSettings] = useImmerAtom(AUTH_SETTINGS_ATOM);
  const hasSupport = useAtomValue(supportsBiometricsSelector);

  const toggle = () => setSettings((s) => ({ ...s, require: !s.require }));

  useEffect(() => {
    if (require === null && hasSupport) setSettings((settings) => ({ ...settings, require: true }));
  }, [require === null, setSettings, hasSupport]);

  return (
    <ListItem
      leading={(props) => <FingerprintIcon {...props} size={useStyles().icon.fontSize} />}
      headline="Biometrics"
      supporting="Require on app open and approval"
      trailing={({ disabled }) => (
        <Switch value={require ?? true} onValueChange={toggle} disabled={disabled} />
      )}
      disabled={!hasSupport}
    />
  );
};

const useStyles = makeStyles(({ iconSize }) => ({
  icon: {
    fontSize: iconSize.medium,
  },
}));
