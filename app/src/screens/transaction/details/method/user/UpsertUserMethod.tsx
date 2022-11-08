import { Address, Call, tryDecodeUpsertUserData } from 'lib';
import { memo } from 'react';
import { Button, Text } from 'react-native-paper';
import assert from 'assert';
import { useUser } from '~/queries/user/useUser.api';
import { useTxContext } from '~/screens/transaction/TransactionProvider';
import { Box } from '~/components/layout/Box';
import { StyleProp, ViewStyle } from 'react-native';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const useDecodedUpsertUserMethod = (account: Address, call?: Call) => {
  const upsertedUser = tryDecodeUpsertUserData(call?.data);

  const [user] = useUser(
    upsertedUser
      ? {
          account,
          addr: upsertedUser.addr,
        }
      : undefined,
  );

  return upsertedUser && user ? { user, ...upsertedUser } : undefined;
};

export interface UpsertUserMethodProps {
  call: Call;
  style?: StyleProp<ViewStyle>;
}

export const UpsertUserMethod = memo(({ call, style }: UpsertUserMethodProps) => {
  const { account, proposal } = useTxContext();
  const { navigate } = useRootNavigation();

  const upsert = useDecodedUpsertUserMethod(account.addr, call);
  assert(upsert);

  return (
    <Box horizontal justifyContent="space-between" alignItems="center" style={style}>
      <Text variant="titleMedium">{`Modify ${upsert.user.name}`}</Text>

      <Button
        onPress={() =>
          navigate('User', {
            user: upsert.user,
            proposed: {
              configs: upsert.configs,
              proposal,
            },
          })
        }
      >
        View
      </Button>
    </Box>
  );
});
