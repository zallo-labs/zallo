import { materialIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Switch } from 'react-native-paper';
import { ListItem } from '~/components/list/ListItem';
import { AUTH_SETTINGS_ATOM, SUPPORTS_BIOMETRICS } from '~/provider/AuthGate';
import { useEffect } from 'react';
import { useImmerAtom } from 'jotai-immer';
import { atom, useAtomValue } from 'jotai';

const supportsBiometricsAtom = atom(SUPPORTS_BIOMETRICS);

const FingerprintIcon = materialIcon('fingerprint');

export const RequireBiometricsItem = () => {
  const [{ require }, setSettings] = useImmerAtom(AUTH_SETTINGS_ATOM);
  const hasSupport = useAtomValue(supportsBiometricsAtom);

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
