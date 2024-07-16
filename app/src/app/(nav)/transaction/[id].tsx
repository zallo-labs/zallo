import { AppbarMore } from '#/Appbar/AppbarMore';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { zUuid } from '~/lib/zod';
import { TransactionStatus } from '#/transaction/TransactionStatus';
import { createStyles, useStyles } from '@theme/styles';
import { Divider, Menu } from 'react-native-paper';
import { FeesSection } from '#/transaction/FeesSection';
import { OperationsSection } from '#/transaction/OperationsSection';
import { TransactionActions } from '#/transaction/TransactionActions';
import { TransfersSection } from '#/transaction/TransfersSection';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { SideSheet } from '#/SideSheet/SideSheet';
import { ProposalApprovals } from '#/policy/ProposalApprovals';
import { AccountSection } from '#/proposal/AccountSection';
import { DappHeader } from '#/walletconnect/DappHeader';
import { ScheduleSection } from '#/transaction/ScheduleSection';
import { useRemoveTransaction } from '#/transaction/useRemoveTransaction';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { graphql } from 'relay-runtime';
import { useFragment, useLazyLoadQuery, useSubscription } from 'react-relay';
import { useMemo } from 'react';
import { Id_TransactionScreenQuery } from '~/api/__generated__/Id_TransactionScreenQuery.graphql';
import { Id_TransactionScreen_transaction$key } from '~/api/__generated__/Id_TransactionScreen_transaction.graphql';

const Query = graphql`
  query Id_TransactionScreenQuery($id: ID!) {
    transaction(id: $id) @required(action: THROW) {
      ...Id_TransactionScreen_transaction @arguments(transaction: $id)
    }

    user {
      id
      ...TransactionActions_user
    }
  }
`;

const Subscription = graphql`
  subscription Id_TransactionScreenSubscription($transaction: ID!) {
    proposalUpdated(input: { proposals: [$transaction] }) {
      id
      event
      proposal {
        ...Id_TransactionScreen_transaction @arguments(transaction: $transaction) @alias
        ...TransactionItem_transaction
      }
    }
  }
`;

const Transaction = graphql`
  fragment Id_TransactionScreen_transaction on Transaction
  @argumentDefinitions(transaction: { type: "ID!" }) {
    id
    account {
      id
      address
      ...AccountSection_account
      ...useRemoveTransaction_account
    }
    dapp {
      ...DappHeader_dappMetadata
    }
    ...useRemoveTransaction_transaction
    ...TransactionStatus_transaction
    ...OperationsSection_transaction
    ...ScheduleSection_transaction
    ...TransfersSection_transaction @arguments(transaction: $transaction)
    ...FeesSection_transaction @arguments(transaction: $transaction)
    ...TransactionActions_transaction
  }
`;

const TransactionScreenParams = z.object({ id: zUuid() });

function TransactionScreen() {
  const { styles } = useStyles(stylesheet);
  const { id } = useLocalParams(TransactionScreenParams);

  const query = useLazyLoadQuery<Id_TransactionScreenQuery>(Query, { id });
  const t = useFragment<Id_TransactionScreen_transaction$key>(Transaction, query.transaction);
  const remove = useRemoveTransaction({ account: t.account, transaction: t });

  useSubscription(
    useMemo(() => ({ subscription: Subscription, variables: { transaction: id } }), [id]),
  );

  return (
    <>
      <AppbarOptions
        headline={<TransactionStatus transaction={t} />}
        {...(remove && {
          trailing: (props) => (
            <AppbarMore iconProps={props}>
              {({ handle }) => <Menu.Item title="Remove" onPress={handle(remove)} />}
            </AppbarMore>
          ),
        })}
      />

      <SideSheetLayout defaultVisible>
        <ScrollableScreenSurface>
          {t.dapp && <DappHeader dapp={t.dapp} action="wants you to execute" />}

          <AccountSection account={t.account} />
          <Divider horizontalInset style={styles.divider} />

          <ScheduleSection transaction={t}>
            <Divider horizontalInset style={styles.divider} />
          </ScheduleSection>

          <OperationsSection transaction={t} />
          <Divider horizontalInset style={styles.divider} />

          <TransfersSection transaction={t}>
            <Divider horizontalInset style={styles.divider} />
          </TransfersSection>

          <FeesSection transaction={t} />

          <TransactionActions transaction={t} user={query.user} />
        </ScrollableScreenSurface>

        <SideSheet headline="Approvals">
          <ProposalApprovals proposal={id} />
        </SideSheet>
      </SideSheetLayout>
    </>
  );
}

const stylesheet = createStyles({
  approvalsButton: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
});

export default withSuspense(TransactionScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
