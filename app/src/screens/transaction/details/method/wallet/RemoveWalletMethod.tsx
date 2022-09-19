import assert from 'assert';
import { Call, tryDecodeRemoveWalletData } from 'lib';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { AccordionProps } from '~/components/Accordion';
import { Proposal } from '~/queries/proposal';
import { CombinedUser, useUser } from '~/queries/user/useUser.api';
import { useTxContext } from '~/screens/transaction/TransactionProvider';

export const useDecodedRemoveUserMethod = (proposal: Proposal) => {
  const removeUser = tryDecodeRemoveWalletData(proposal.data);
}

export const getRemoveWalletMethodName = (user: CombinedUser) =>
  `Remove user: ${user.name}`;

export interface RemoveWalletMethodProps extends Partial<AccordionProps> {
  call: Call;
}

export const RemoveWalletMethod = memo(
  ({ call, ...accordionProps }: RemoveWalletMethodProps) => {
    const { account } = useTxContext();

    const removedUser = tryDecodeRemoveWalletData(call.data);
    assert(removedUser);
    const [user] = useUser({
      account: account.addr,
      addr: removedUser.addr,
    });

    return (
      <Text variant="titleMedium" {...accordionProps}>
        {getRemoveWalletMethodName(user)}
      </Text>
    );
  },
);
