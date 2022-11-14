import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text, TouchableRipple } from 'react-native-paper';
import { CardItemSkeleton } from '../../components/card/CardItemSkeleton';
import { UserId } from 'lib';
import { useUser } from '~/queries/user/useUser.api';
import { Box } from '~/components/layout/Box';
import { LabelIcon } from '~/components/Identicon/LabelIcon';
import { makeStyles } from '@theme/makeStyles';
import { memo } from 'react';
import { truncateAddr } from '~/util/format';
import { useAddrName } from '~/components/addr/useAddrName';

export interface UserItemProps {
  user: UserId;
  onPress?: () => void;
}

export const UserItem = memo(({ user: id, onPress }: UserItemProps) => {
  const styles = useStyles();
  const [user] = useUser(id);
  const name = useAddrName(user.addr);

  return (
    <TouchableRipple onPress={onPress} style={styles.root}>
      <Box horizontal alignItems="center">
        <LabelIcon label={user.name} style={styles.icon} />

        <Box flex={1} vertical justifyContent="center">
          <Text variant="titleMedium">{user.name}</Text>

          {name && name !== user.name && <Text variant="bodyMedium">{name}</Text>}
        </Box>

        <Text variant="bodyMedium">{truncateAddr(user.addr)}</Text>
      </Box>
    </TouchableRipple>
  );
});

const useStyles = makeStyles(({ space }) => ({
  root: {
    padding: space(2),
  },
  icon: {
    marginRight: space(2),
  },
}));

export default withSkeleton(UserItem, CardItemSkeleton);
