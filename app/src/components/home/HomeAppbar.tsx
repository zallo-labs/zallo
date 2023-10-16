import { ScanIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { AccountSelector } from '~/components/AccountSelector';
import { FragmentType, gql, useFragment } from '@api/generated';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';

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
      headline={() => (
        <View style={styles.selectorContainer}>
          <AccountSelector account={account} />
        </View>
      )}
      trailing={() => (
        <ScanIcon
          onPress={() => router.push({ pathname: `/scan/`, params: { account: account.address } })}
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
