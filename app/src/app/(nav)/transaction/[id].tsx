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
  query Id_TransactionScreenQuery($transaction: ID!) {
    transaction(input: { id: $transaction }) @required(action: THROW) {
      # ...Id_TransactionScreen_transaction @arguments(transaction: $transaction)
      id
      account {
        id
        address
        ...AccountSection_account
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

  // Extract account from Transaction result, and use it as a variable to get the full result
  const query = useLazyLoadQuery<Id_TransactionScreenQuery>(
    Query,
    { transaction: id },
    { UNSTABLE_renderPolicy: 'full' },
  );
  // const p = useFragment<Id_TransactionScreen_transaction$key>(Transaction, query.transaction);
  const p = query.transaction;
  const remove = useRemoveTransaction(p);

  // useSubscription(
  //   useMemo(() => ({ subscription: Subscription, variables: { transaction: id } }), [id]),
  // );

  return (
    <>
      <AppbarOptions
        headline={(props) => <TransactionStatus transaction={p} {...props} />}
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
          {p.dapp && <DappHeader dapp={p.dapp} action="wants you to execute" />}

          <AccountSection account={p.account} />
          <Divider horizontalInset style={styles.divider} />

          <ScheduleSection transaction={p}>
            <Divider horizontalInset style={styles.divider} />
          </ScheduleSection>

          <OperationsSection transaction={p} />
          <Divider horizontalInset style={styles.divider} />

          <TransfersSection transaction={p}>
            <Divider horizontalInset style={styles.divider} />
          </TransfersSection>

          <FeesSection transaction={p} />

          <TransactionActions transaction={p} user={query.user} />
        </ScrollableScreenSurface>

        {/* <SideSheet headline="Approvals">
          <ProposalApprovals proposal={id} />
        </SideSheet> */}
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
