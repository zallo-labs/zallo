import { Address, Call, tryDecodeUpsertUserData } from 'lib';
import { memo } from 'react';
import { Button, Text } from 'react-native-paper';
import assert from 'assert';
import { CombinedUser, useUser } from '~/queries/user/useUser.api';
import { useTxContext } from '~/screens/transaction/TransactionProvider';
import { Box } from '~/components/layout/Box';
import { StyleProp, ViewStyle } from 'react-native';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useDecodedUpsertUserMethod = (account: Address, call?: Call) => {
  const upsertedUser = tryDecodeUpsertUserData(call?.data);

  const userData = useUser(
    upsertedUser
      ? {
          account,
          addr: upsertedUser.addr,
        }
      : undefined,
  );

  return [upsertedUser, userData] as const;
};

export const getUpsertUserMethodName = (user: CombinedUser) => {
  // TODO: Use more specific add/update
  return `Upsert user: ${user.name}`;
};

export interface UpsertUserMethodProps {
  call: Call;
  style?: StyleProp<ViewStyle>;
}

export const UpsertUserMethod = memo(
  ({ call, style }: UpsertUserMethodProps) => {
    const { account, proposal } = useTxContext();
    const { navigate } = useRootNavigation();

    const [upsertedUser, [user]] = useDecodedUpsertUserMethod(
      account.addr,
      call,
    );
    assert(upsertedUser && user);

    return (
      <Box
        horizontal
        justifyContent="space-between"
        alignItems="center"
        style={style}
      >
        <Text variant="titleMedium">{getUpsertUserMethodName(user)}</Text>

        <Button
          onPress={() =>
            navigate('User', {
              user,
              proposed: {
                configs: upsertedUser.configs,
                proposal,
              },
            })
          }
        >
          View
        </Button>
      </Box>
    );
  },
);
