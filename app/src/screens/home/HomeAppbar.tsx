import { ScanIcon, SettingsOutlineIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Appbar as BaseAppbar } from 'react-native-paper';
import { AccountSelector } from '~/components/AccountSelector/AccountSelector';
import { useNavigation } from '@react-navigation/native';
import { Address } from 'lib';

export interface HomeAppbarProps {
  account: Address;
}

export const HomeAppbar = ({ account }: HomeAppbarProps) => {
  const { navigate } = useNavigation();

  return (
    <BaseAppbar.Header>
      <View style={styles.selectorContainer}>
        <AccountSelector account={account} />
      </View>

      <BaseAppbar.Action icon={ScanIcon} onPress={() => navigate('Scan', { account })} />
      <BaseAppbar.Action
        icon={SettingsOutlineIcon}
        onPress={() => navigate('Settings', { account })}
      />
    </BaseAppbar.Header>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
});
