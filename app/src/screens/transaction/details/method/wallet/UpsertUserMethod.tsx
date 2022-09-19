import { Call, tryDecodeUpsertUserData } from 'lib';
import { memo, useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Accordion, AccordionProps } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import assert from 'assert';
import { CombinedUser, useUser } from '~/queries/user/useUser.api';
import { useTxContext } from '~/screens/transaction/TransactionProvider';

export const getUpsertWalletMethodName = (user: CombinedUser) => {
  // TODO: Replace upsert with add/update
  return `Upsert wallet: ${user.name}`;
};

export interface UpsertUserMethodProps extends Partial<AccordionProps> {
  call: Call;
}

export const UpsertUserMethod = memo(
  ({ call, ...accordionProps }: UpsertUserMethodProps) => {
    const { account } = useTxContext();

    const upsertedUser = tryDecodeUpsertUserData(call.data);
    assert(upsertedUser);
    const [user] = useUser(upsertedUser.addr);

    // TODO: implement 
    return null;

    // return (
    //   <Accordion
    //     title={
    //       <Text variant="titleMedium">{getUpsertWalletMethodName(user)}</Text>
    //     }
    //     {...accordionProps}
    //   >
    //     <Box mx={3}>
    //       <ModifiedQuorums quorums={user.quorums} />
    //       <ModifiedSpending limits={user.limits} />
    //     </Box>
    //   </Accordion>
    // );
  },
);
