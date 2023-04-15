import { materialIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Switch } from 'react-native-paper';
import { useRecoilState } from 'recoil';
import { ListItem } from '~/components/list/ListItem';
import { authSettingsAtom, useSupportsBiometrics } from '~/provider/AuthGate';

const FingerprintIcon = materialIcon('fingerprint');

export const RequireBiometricsItem = () => {
  const [{ requireBiometrics }, setSettings] = useRecoilState(authSettingsAtom);

  const disabled = !useSupportsBiometrics();
  const toggle = () => setSettings((s) => ({ ...s, requireBiometrics: !s.requireBiometrics }));

  return (
    <ListItem
      leading={(props) => <FingerprintIcon {...props} size={useStyles().icon.fontSize} />}
      headline="Biometrics"
      supporting="Require on app open and approval"
      trailing={<Switch value={requireBiometrics} onValueChange={toggle} disabled={disabled} />}
      disabled={disabled}
    />
  );
};

const useStyles = makeStyles(({ iconSize }) => ({
  icon: {
    fontSize: iconSize.medium,
  },
}));
