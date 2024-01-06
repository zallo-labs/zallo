import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';

import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { createStyles, useStyles } from '~/util/theme/styles';
import { Chevron } from './Chevron';

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
  const account = useFragment(FragmentDoc, props.account);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.push(`/accounts/`)}>
      <Text variant="titleLarge" numberOfLines={1} style={styles.text}>
        {account.name}
      </Text>

      <Chevron style={styles.text} />
    </TouchableOpacity>
  );
};

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
