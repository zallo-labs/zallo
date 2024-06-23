import { Text } from 'react-native-paper';
import { Chevron } from './Chevron';
import { FragmentType, gql, useFragment } from '@api/generated';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { AddressIcon } from './Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';
import { memo } from 'react';
import { PressableOpacity } from './PressableOpacity';

const FragmentDoc = gql(/* GraphQL */ `
  fragment AccountSelector_Account on Account {
    id
    address
    name
  }
`);

export interface AccountSelectorParams {
  account: FragmentType<typeof FragmentDoc>;
}

export function AccountSelector(props: AccountSelectorParams) {
  const account = useFragment(FragmentDoc, props.account);
  const { styles } = useStyles(stylesheet);

  return (
    <Link href={`/(sheet)/accounts`} asChild>
      <PressableOpacity style={styles.container}>
        {/* <AddressIcon address={account.address} size={ICON_SIZE.small} /> */}

        <Text variant="titleLarge" numberOfLines={1} style={styles.text}>
          {account.name}
        </Text>

        <Chevron style={styles.text} />
      </PressableOpacity>
    </Link>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: corner.m,
    marginLeft: 32, // Centers element
  },
  text: {
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
}));
