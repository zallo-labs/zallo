import { gql } from '@api';
import { makeStyles } from '@theme/makeStyles';
import { ICON_SIZE } from '@theme/paper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query UserHeader {
    user {
      id
      name
      photoUri
    }
  }
`);

function UserHeader_() {
  const styles = useStyles();
  const router = useRouter();

  const { user } = useQuery(Query).data;

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.push(`/(drawer)/user`)}>
      {user.photoUri ? (
        <Image source={user.photoUri} style={styles.icon} />
      ) : (
        <Avatar.Text
          label={getAvatarLabel(user.name)}
          style={[styles.icon, styles.avatar]}
          labelStyle={styles.avatarLabel}
        />
      )}

      <Text variant="titleLarge" style={styles.userName}>
        {user.name}
      </Text>
    </TouchableOpacity>
  );
}

export const UserHeader = withSuspense(UserHeader_);

const useStyles = makeStyles(({ colors }) => ({
  container: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  icon: {
    width: ICON_SIZE.large,
    height: ICON_SIZE.large,
    borderRadius: ICON_SIZE.large / 2,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  avatarLabel: {
    color: colors.onPrimary,
  },
  userName: {
    marginTop: 8,
    color: colors.onSurfaceVariant,
  },
}));

function getAvatarLabel(name: string | null | undefined) {
  // Fnu Lnu -> FL
  return (name ?? '?')
    .split(' ')
    .map((v) => v[0])
    .join('');
}
