import { ScanIcon, SettingsOutlineIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { Appbar as BaseAppbar } from 'react-native-paper';
import { AccountSelector } from '~/components/AccountSelector';
import { useNavigation } from '@react-navigation/native';
import { FragmentType, gql, useFragment } from '@api/generated';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';

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
  const router = useRouter();
  const account = useFragment(FragmentDoc, props.account);

  return (
    <AppbarOptions
      // leading={AppbarMenu}
      headline={() => (
        <View style={styles.selectorContainer}>
          <AccountSelector account={account} />
        </View>
      )}
      trailing={[
        () => (
          <ScanIcon
            onPress={() =>
              router.push({ pathname: `/[account]/scan/`, params: { account: account.address } })
            }
          />
        ),
      ]}
    />
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    // flex: 1,
    marginHorizontal: 16,
  },
});
