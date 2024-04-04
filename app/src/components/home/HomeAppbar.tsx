import { ScanIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { AccountSelector } from '#/AccountSelector';
import { FragmentType, gql, useFragment } from '@api/generated';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { useRouter } from 'expo-router';
import { memo } from 'react';

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

function HomeAppbar_(props: HomeAppbarProps) {
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
}

const styles = StyleSheet.create({
  selectorContainer: {
    marginHorizontal: 16,
  },
});

export const HomeAppbar = memo(HomeAppbar_);
