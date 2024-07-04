import { Text } from 'react-native-paper';
import { Chevron } from './Chevron';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { AddressIcon } from './Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';
import { memo } from 'react';
import { PressableOpacity } from './PressableOpacity';
import { AccountSelector_account$key } from '~/api/__generated__/AccountSelector_account.graphql';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';

const Account = graphql`
  fragment AccountSelector_account on Account {
    id
    address
    name
  }
`;

export interface AccountSelectorParams {
  account: AccountSelector_account$key;
}

export function AccountSelector(props: AccountSelectorParams) {
  const account = useFragment(Account, props.account);
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
