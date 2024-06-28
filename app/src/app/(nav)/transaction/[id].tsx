import { AppbarMore } from '#/Appbar/AppbarMore';
import { gql, useFragment } from '@api/generated';
import { NotFound } from '#/NotFound';
import { DocumentVariables, getOptimizedDocument, useQuery } from '~/gql';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { zUuid } from '~/lib/zod';
import { TransactionStatus } from '#/transaction/TransactionStatus';
import { useSubscription } from 'urql';
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

const Transaction = gql(/* GraphQL */ `
  fragment TransactionScreen_Transaction on Transaction
  @argumentDefinitions(transaction: { type: "ID!" }) {
    id
    account {
      id
      address
      ...AccountSection_Account
    }
    dapp {
      ...DappHeader_DappMetadata
    }
    ...useRemoveTransaction_Transaction
    ...TransactionStatus_Transaction
    ...OperationsSection_Transaction
    ...ScheduleSection_Transaction
    ...TransfersSection_Transaction @arguments(transaction: $transaction)
    ...FeesSection_Transaction @arguments(transaction: $transaction)
    ...TransactionActions_Transaction @arguments(transaction: $transaction)
  }
`);

const Query = gql(/* GraphQL */ `
  query TransactionScreen($transaction: ID!) {
    transaction(input: { id: $transaction }) {
      ...TransactionScreen_Transaction @arguments(transaction: $transaction)
    }

    user {
      id
      ...TransactionActions_User
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription TransactionScreen_Subscription($transaction: ID!) {
    proposalUpdated(input: { proposals: [$transaction] }) {
      id
      event
      proposal {
        ...TransactionScreen_Transaction @arguments(transaction: $transaction)
      }
    }
  }
`);

const TransactionScreenParams = z.object({ id: zUuid() });

function TransactionScreen() {
  const { styles } = useStyles(stylesheet);
  const { id } = useLocalParams(TransactionScreenParams);

  // Extract account from Transaction result, and use it as a variable to get the full result
  const variables = { transaction: id } satisfies DocumentVariables<typeof Query>;
  const query = useQuery(Query, variables);
  useSubscription({ query: getOptimizedDocument(Subscription), variables });

  const p = useFragment(Transaction, query.data?.transaction);
  const remove = useRemoveTransaction(p);

  if (!p) return query.stale ? null : <NotFound name="Proposal" />;

  return (
    <>
      <AppbarOptions
        headline={(props) => <TransactionStatus proposal={p} {...props} />}
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

          <ScheduleSection proposal={p}>
            <Divider horizontalInset style={styles.divider} />
          </ScheduleSection>

          <OperationsSection proposal={p} />
          <Divider horizontalInset style={styles.divider} />

          <TransfersSection proposal={p}>
            <Divider horizontalInset style={styles.divider} />
          </TransfersSection>

          <FeesSection proposal={p} />

          <TransactionActions proposal={p} user={query.data.user} />
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
