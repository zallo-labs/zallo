import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { gql, useFragment } from '@api/generated';
import { NotFound } from '~/components/NotFound';
import { DocumentVariables, getOptimizedDocument, useQuery } from '~/gql';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { ScrollableScreenSurface } from '~/components/layout/ScrollableScreenSurface';
import { zUuid } from '~/lib/zod';
import { RemoveTransactionItem } from '~/components/transaction/RemoveTransactionItem';
import { TransactionStatus } from '~/components/transaction/TransactionStatus';
import { UAddress, asUAddress, ZERO_ADDR } from 'lib';
import { useEffect, useState } from 'react';
import { useSubscription } from 'urql';
import { createStyles, useStyles } from '@theme/styles';
import { Divider } from 'react-native-paper';
import { FeesSection } from '~/components/transaction/FeesSection';
import { OperationsSection } from '~/components/transaction/OperationsSection';
import { TransactionActions } from '~/components/transaction/TransactionActions';
import { TransfersSection } from '~/components/transaction/TransfersSection';
import { SideSheetLayout } from '~/components/SideSheet/SideSheetLayout';
import { SideSheet } from '~/components/SideSheet/SideSheet';
import { useSideSheetVisibility } from '~/components/SideSheet/useSideSheetVisibility';
import { ProposalApprovals } from '~/components/policy/ProposalApprovals';

const TransactionProposal = gql(/* GraphQL */ `
  fragment TransactionScreen_TransactionProposal on TransactionProposal
  @argumentDefinitions(
    proposal: { type: "UUID!" }
    account: { type: "UAddress!" }
    includeAccount: { type: "Boolean!" }
  ) {
    id
    account {
      id
      address
      name
    }
    ...TransactionStatus_TransactionProposal
    ...OperationsSection_TransactionProposal
    ...TransfersSection_TransactionProposal
      @arguments(account: $account, includeAccount: $includeAccount)
    ...FeesSection_TransactionProposal
      @arguments(account: $account, includeAccount: $includeAccount)
    ...TransactionActions_TransactionProposal @arguments(proposal: $proposal)
  }
`);

const Query = gql(/* GraphQL */ `
  query TransactionScreen($proposal: UUID!, $account: UAddress!, $includeAccount: Boolean!) {
    transactionProposal(input: { id: $proposal }) {
      ...TransactionScreen_TransactionProposal
        @arguments(proposal: $proposal, account: $account, includeAccount: $includeAccount)
    }

    user {
      id
      ...TransactionActions_User
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription TransactionScreen_Subscription(
    $proposal: UUID!
    $account: UAddress!
    $includeAccount: Boolean!
  ) {
    proposal(input: { proposals: [$proposal] }) {
      ...TransactionScreen_TransactionProposal
        @arguments(proposal: $proposal, account: $account, includeAccount: $includeAccount)
    }
  }
`);

const TransactionScreenParams = z.object({ id: zUuid() });

export default function TransactionScreen() {
  const { styles } = useStyles(stylesheet);
  const { id } = useLocalParams(TransactionScreenParams);
  const sideSheet = useSideSheetVisibility();

  // Extract account from TransactionProposal result, and use it as a variable to get the full result
  const [account, setAccount] = useState<UAddress>();
  const variables = {
    proposal: id,
    account: account ?? asUAddress(ZERO_ADDR, 'zksync'),
    includeAccount: !!account,
  } satisfies DocumentVariables<typeof Query>;

  const query = useQuery(Query, variables);
  useSubscription({ query: getOptimizedDocument(Subscription), variables });
  const p = useFragment(TransactionProposal, query.data?.transactionProposal);

  useEffect(() => {
    if (account !== p?.account.address) setAccount(p?.account.address);
  }, [account, p?.account.address]);

  if (!p) return query.stale ? null : <NotFound name="Proposal" />;

  return (
    <SideSheetLayout>
      <AppbarOptions
        headline={p.account.name}
        trailing={(props) => (
          <AppbarMore iconProps={props}>
            {({ close }) => <RemoveTransactionItem proposal={id} close={close} />}
          </AppbarMore>
        )}
      />

      <ScrollableScreenSurface>
        <TransactionStatus proposal={p} />

        <OperationsSection proposal={p} />
        <Divider horizontalInset style={styles.divider} />

        <TransfersSection proposal={p}>
          <Divider horizontalInset style={styles.divider} />
        </TransfersSection>

        <FeesSection proposal={p} />
        <Divider horizontalInset style={styles.divider} />

        <TransactionActions proposal={p} user={query.data.user} approvalsSheet={sideSheet} />
      </ScrollableScreenSurface>

      <SideSheet headline="Approvals" {...sideSheet}>
        <ProposalApprovals proposal={id} />
      </SideSheet>
    </SideSheetLayout>
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
