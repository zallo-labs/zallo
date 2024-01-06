import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AccountSelector } from '~/components/AccountSelector';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { ScanIcon } from '~/util/theme/icons';

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
      leading="menu"
      center
      headline={() => (
        <View style={styles.selectorContainer}>
          <AccountSelector account={account} />
        </View>
      )}
      trailing={(props) => (
        <ScanIcon
          onPress={() => router.push({ pathname: `/scan/`, params: { account: account.address } })}
          {...props}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    marginHorizontal: 16,
  },
});
