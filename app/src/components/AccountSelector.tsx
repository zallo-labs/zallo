import { Text } from 'react-native-paper';
import { Chevron } from './Chevron';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useRouter } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { AddressIcon } from './Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';
import { memo } from 'react';
import { PressableOpacity } from './PressableOpacity';

const FragmentDoc = gql(/* GraphQL */ `
  fragment AccountSelector_account on Account {
    id
    address
    name
  }
`);

export interface AccountSelectorParams {
  account: FragmentType<typeof FragmentDoc>;
}

function AccountSelector_(props: AccountSelectorParams) {
  const account = useFragment(FragmentDoc, props.account);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();

  return (
    <PressableOpacity style={styles.container} onPress={() => router.push(`/(sheet)/accounts`)}>
      <AddressIcon address={account.address} size={ICON_SIZE.small} />

      <Text variant="titleLarge" numberOfLines={1} style={styles.text}>
        {account.name}
      </Text>

      <Chevron style={styles.text} />
    </PressableOpacity>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
}));

export const AccountSelector = memo(AccountSelector_);
