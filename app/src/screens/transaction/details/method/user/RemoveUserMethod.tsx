import assert from 'assert';
import { Address, Call, tryDecodeRemoveUserData } from 'lib';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { AccordionProps } from '~/components/Accordion';
import { useUser } from '~/queries/user/useUser.api';
import { useTxContext } from '~/screens/transaction/TransactionProvider';

export const useDecodedRemoveUserMethod = (account: Address, call?: Call) => {
  const removedUser = tryDecodeRemoveUserData(call?.data);

  return useUser(
    removedUser
      ? {
          account,
          addr: removedUser.addr,
        }
      : undefined,
  );
};

export interface RemoveUserMethodProps extends Partial<AccordionProps> {
  call: Call;
}

export const RemoveUserMethod = memo(({ call, ...accordionProps }: RemoveUserMethodProps) => {
  const { account } = useTxContext();

  const [user] = useDecodedRemoveUserMethod(account.addr, call);
  assert(user);

  return (
    <Text variant="titleMedium" {...accordionProps}>
      {`Remove: ${user.name}`}
    </Text>
  );
});
