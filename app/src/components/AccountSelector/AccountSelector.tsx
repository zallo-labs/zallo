import { makeStyles } from '@theme/makeStyles';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { AddressIcon } from '../Identicon/AddressIcon';
import { useNavigation } from '@react-navigation/native';
import { Chevron } from '../Chevron';
import { FragmentType, gql, useFragment } from '@api/gen';

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

export const AccountSelector = (props: AccountSelectorParams) => {
  const styles = useStyles();
  const { navigate } = useNavigation();
  const account = useFragment(FragmentDoc, props.account);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigate('AccountsSheet', { account: account.address })}
    >
      <AddressIcon address={account.address} size={styles.icon.fontSize} />

      <Text variant="titleLarge" numberOfLines={1} style={styles.text}>
        {account.name}
      </Text>

      <Chevron style={styles.text} />
    </TouchableOpacity>
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: iconSize.small,
  },
  text: {
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
}));
