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
import { Id_TransactionScreen2Query } from '~/api/__generated__/Id_TransactionScreen2Query.graphql';
import { TransactionStatus } from '#/transaction/TransactionStatus';
import { TransactionOperations } from '#/transaction/TransactionOperations';
import { TransactionResponse } from '#/transaction/TransactionResponse';
import { TransactionTransfers } from '#/transaction/TransactionTransfers';
import { TransactionDetails } from '#/transaction/TransactionDetails';
import { TransactionActions } from '#/transaction/TransactionActions';
import { useFragment, useSubscription } from 'react-relay';
import { Id_TransactionScreen2_transaction$key } from '~/api/__generated__/Id_TransactionScreen2_transaction.graphql';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { ProposalApprovals } from '#/policy/ProposalApprovals';
import { Id_TransactionScreen2Subscription } from '~/api/__generated__/Id_TransactionScreen2Subscription.graphql';
import { useMemo } from 'react';
import { BareSideSheet } from '#/SideSheet/BareSideSheet';

const Query = graphql`
  query Id_TransactionScreen2Query($id: ID!) {
    transaction(id: $id) @required(action: THROW) {
      ...Id_TransactionScreen2_transaction @arguments(id: $id)
    }

    user {
      id
      ...TransactionActions_user
    }
  }
`;

const Subscription = graphql`
  subscription Id_TransactionScreen2Subscription($id: ID!) {
    proposalUpdated(input: { proposals: [$id] }) {
      proposal {
        ...Id_TransactionScreen2_transaction @arguments(id: $id)
      }
    }
  }
`;

const Transaction = graphql`
  fragment Id_TransactionScreen2_transaction on Transaction
  @argumentDefinitions(id: { type: "ID!" }) {
    id
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

  useSubscription<Id_TransactionScreen2Subscription>(
    useMemo(() => ({ subscription: Subscription, variables: { id } }), [id]),
  );

  const { user, ...query } = useLazyQuery<Id_TransactionScreen2Query>(Query, { id });
  const t = useFragment<Id_TransactionScreen2_transaction$key>(Transaction, query.transaction);

  return (
    <SideSheetLayout defaultVisible>
      <Pane flex>
        <Scrollable>
          <Appbar mode="small" />
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
