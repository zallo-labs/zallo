import { zUuid } from '~/lib/zod';
import { AccountParams } from '../../../_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { Pane } from '#/layout/Pane';
import { Scrollable } from '#/Scrollable';
import { Appbar } from '#/Appbar/Appbar';
import { Id_TransactionScreenQuery } from '~/api/__generated__/Id_TransactionScreenQuery.graphql';
import { TransactionStatus } from '#/transaction/TransactionStatus';
import { TransactionOperations } from '#/transaction/TransactionOperations';
import { TransactionResponse } from '#/transaction/TransactionResponse';
import { TransactionTransfers } from '#/transaction/TransactionTransfers';
import { TransactionDetails } from '#/transaction/TransactionDetails';
import { TransactionActions } from '#/transaction/TransactionActions';
import { useFragment, useSubscription } from 'react-relay';
import { Id_TransactionScreen_transaction$key } from '~/api/__generated__/Id_TransactionScreen_transaction.graphql';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { ProposalApprovals } from '#/policy/ProposalApprovals';
import { Id_TransactionScreenSubscription } from '~/api/__generated__/Id_TransactionScreenSubscription.graphql';
import { useMemo } from 'react';
import { BareSideSheet } from '#/SideSheet/BareSideSheet';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { useRemoveTransaction } from '#/transaction/useRemoveTransaction';
import { Menu } from 'react-native-paper';

const Query = graphql`
  query Id_TransactionScreenQuery($id: ID!) {
    transaction(id: $id) @required(action: THROW) {
      ...Id_TransactionScreen_transaction @arguments(id: $id)
    }

    user {
      id
      ...TransactionActions_user
    }
  }
`;

const Subscription = graphql`
  subscription Id_TransactionScreenSubscription($id: ID!) {
    proposalUpdated(input: { proposals: [$id] }) {
      proposal {
        ...Id_TransactionScreen_transaction @arguments(id: $id)
      }
    }
  }
`;

const Transaction = graphql`
  fragment Id_TransactionScreen_transaction on Transaction
  @argumentDefinitions(id: { type: "ID!" }) {
    id
    ...useRemoveTransaction_transaction
    ...TransactionStatus_transaction
    ...TransactionOperations_transaction
    ...TransactionTransfers_transaction @arguments(transaction: $id)
    ...TransactionResponse_transaction
    ...TransactionDetails_transaction
    ...TransactionActions_transaction
  }
`;

const TransactionScreenParams = AccountParams.extend({ id: zUuid() });

function TransactionScreen() {
  const { id } = useLocalParams(TransactionScreenParams);

  useSubscription<Id_TransactionScreenSubscription>(
    useMemo(() => ({ subscription: Subscription, variables: { id } }), [id]),
  );

  const { user, ...query } = useLazyQuery<Id_TransactionScreenQuery>(Query, { id });
  const t = useFragment<Id_TransactionScreen_transaction$key>(Transaction, query.transaction);
  const remove = useRemoveTransaction({ transaction: t });

  return (
    <SideSheetLayout defaultVisible>
      <Pane flex>
        <Scrollable>
          <Appbar
            mode="small"
            {...(remove && {
              trailing: (props) => (
                <AppbarMore iconProps={props}>
                  {({ handle }) => <Menu.Item title="Remove" onPress={handle(remove)} />}
                </AppbarMore>
              ),
            })}
          />

          <TransactionStatus transaction={t} />
          <TransactionOperations transaction={t} />
          <TransactionTransfers transaction={t} />
          <TransactionResponse transaction={t} />
          <TransactionDetails transaction={t} />
          <TransactionActions transaction={t} user={user} />
        </Scrollable>
      </Pane>

      <BareSideSheet headline="Approvals">
        <ProposalApprovals proposal={id} />
      </BareSideSheet>
    </SideSheetLayout>
  );
}

export default withSuspense(TransactionScreen, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
