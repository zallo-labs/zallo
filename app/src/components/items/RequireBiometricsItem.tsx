import { materialIcon } from '@theme/icons';
import { Switch } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { ListItem } from '~/components/list/ListItem';
import { authSettingsAtom, useSupportsBiometrics } from '~/provider/AuthGate';

export const RequireBiometricsItem = () => {
  const [{ requireBiometrics }, setSettings] = useRecoilState(authSettingsAtom);

  const toggle = () => setSettings((s) => ({ ...s, requireBiometrics: !s.requireBiometrics }));

  if (!useSupportsBiometrics()) return null;

  return (
    <ListItem
      leading={materialIcon('fingerprint')}
      headline="Biometrics"
      supporting="Require biometrics when opening the app"
      trailing={<Switch value={requireBiometrics} onValueChange={toggle} />}
    />
  );
};
