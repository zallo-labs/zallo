import { ScanIcon, SettingsOutlineIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Appbar as BaseAppbar } from 'react-native-paper';
import { AccountSelector } from '~/components/AccountSelector';
import { useNavigation } from '@react-navigation/native';
import { FragmentType, gql, useFragment } from '@api/generated';

const FragmentDoc = gql(/* GraphQL */ `
  fragment HomeAppbar_account on Account {
    id
    address
    ...AccountSelector_account
  }
`);

export interface HomeAppbarProps {
  account: FragmentType<typeof FragmentDoc>;
}

export const HomeAppbar = (props: HomeAppbarProps) => {
  const { navigate } = useNavigation();
  const account = useFragment(FragmentDoc, props.account);

  return (
    <BaseAppbar.Header>
      <View style={styles.selectorContainer}>
        <AccountSelector account={account} />
      </View>

      <BaseAppbar.Action
        icon={ScanIcon}
        onPress={() => navigate('Scan', { account: account.address })}
      />
      <BaseAppbar.Action
        icon={SettingsOutlineIcon}
        onPress={() => navigate('Settings', { account: account.address })}
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
