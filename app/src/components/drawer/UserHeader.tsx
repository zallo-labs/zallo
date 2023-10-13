import { gql } from '@api';
import { makeStyles } from '@theme/makeStyles';
import { ICON_SIZE } from '@theme/paper';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query UserHeader {
    user {
      id
      name
    }

    approver {
      id
      address
      name
    }
  }
`);

function InternalUserHeader() {
  const styles = useStyles();
  const router = useRouter();

  const { user, approver } = useQuery(Query).data;

  if (!approver) return null;

  return (
    <TouchableOpacity style={styles.userContainer} onPress={() => router.push(`/user`)}>
      <AddressIcon address={approver.address} size={ICON_SIZE.large} />

      <Text variant="titleLarge" style={styles.userName}>
        {user.name}
      </Text>

      <Text variant="bodyLarge" style={styles.approverItem}>
        {approver.name}
      </Text>
    </TouchableOpacity>
  );
}

export const UserHeader = withSuspense(InternalUserHeader, () => null);

const useStyles = makeStyles(({ colors }) => ({
  userContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  userName: {
    marginTop: 8,
  },
  approverItem: {
    color: colors.tertiary,
  },
}));
