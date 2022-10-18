import { getUserIdStr, UserId } from 'lib';
import _ from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Box } from '~/components/layout/Box';
import { useUserIds } from '~/queries/user/useUserIds.api';
import SessionUserItem from './SessionUserItem';

export interface SessionAccountsProps {
  users: UserId[];
  setUsers: Dispatch<SetStateAction<UserId[]>>;
  style?: StyleProp<ViewStyle>;
}

export const SessionAccounts = ({
  users,
  setUsers,
  style,
}: SessionAccountsProps) => {
  const [allUsers] = useUserIds();

  return (
    <Box style={style}>
      {allUsers.map((user) => {
        const selected = !!users.find((u) => _.isEqual(u, user));

        return (
          <SessionUserItem
            key={getUserIdStr(user.account, user.addr)}
            user={user}
            selected={selected}
            onPress={() => {
              setUsers((users) =>
                selected
                  ? users.filter((u) => !_.isEqual(u, user))
                  : [...users, user],
              );
            }}
          />
        );
      })}
    </Box>
  );
};
