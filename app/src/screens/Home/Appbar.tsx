import { ScanIcon, SettingsOutlineIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Appbar as BaseAppbar } from 'react-native-paper';
import { AccountSelector } from '~/components/account2/AccountSelector';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';

export const Appbar = () => {
  const { navigate } = useRootNavigation2();

  return (
    <BaseAppbar.Header>
      <View style={styles.selectorContainer}>
        <AccountSelector />
      </View>

      <BaseAppbar.Action icon={ScanIcon} onPress={() => navigate('Scan', {})} />
      <BaseAppbar.Action icon={SettingsOutlineIcon} onPress={() => navigate('Settings')} />
    </BaseAppbar.Header>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
});
