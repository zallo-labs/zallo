import { ScanIcon, SettingsOutlineIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Appbar as BaseAppbar } from 'react-native-paper';
import { AccountSelector } from '~/components/AccountSelector/AccountSelector';
import { useNavigation } from '@react-navigation/native';

export const HomeAppbar = () => {
  const { navigate } = useNavigation();

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
