import { useLocalParams } from '~/hooks/useLocalParams';
import { ScrollView, StyleSheet, View } from 'react-native';
import { gql, useFragment } from '@api/generated';
import { Divider } from 'react-native-paper';
import { DocumentVariables, getOptimizedDocument, useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { RiskRating } from '~/components/proposal/RiskRating';
import { FeesSection } from '~/components/transaction/FeesSection';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { TransfersSection } from '~/components/transaction/TransfersSection';
import { OperationsSection } from '~/components/transaction/OperationsSection';
import { useEffect, useState } from 'react';
import { UAddress, ZERO_ADDR, asUAddress } from 'lib';
import { TransactionLayoutParams } from '~/app/(drawer)/transaction/[id]/_layout';
import { TransactionActions } from '~/components/transaction/TransactionActions';

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
    ...OperationsSection_TransactionProposal
    ...TransfersSection_TransactionProposal
      @arguments(account: $account, includeAccount: $includeAccount)
    ...FeesSection_TransactionProposal
      @arguments(account: $account, includeAccount: $includeAccount)
    ...RiskRating_Proposal
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

export const TransactionScreenParams = TransactionLayoutParams;

function TransactionScreen() {
  const { id } = useLocalParams(TransactionScreenParams);

  // Extract account from TransactionProposal result, and use it as a variable to get the full result
  const [account, setAccount] = useState<UAddress>();
  const variables = {
    proposal: id,
    account: account ?? asUAddress(ZERO_ADDR, 'zksync'),
    includeAccount: !!account,
  } satisfies DocumentVariables<typeof Query>;

  const { data } = useQuery(Query, variables);
  useSubscription({ query: getOptimizedDocument(Subscription), variables });
  const p = useFragment(TransactionProposal, data?.transactionProposal);

  useEffect(() => {
    if (account !== p?.account.address) setAccount(p?.account.address);
  }, [account, p?.account.address]);

  if (!p) return null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <OperationsSection proposal={p} />
      <Divider horizontalInset style={styles.divider} />

      <TransfersSection proposal={p}>
        <Divider horizontalInset style={styles.divider} />
      </TransfersSection>

      <FeesSection proposal={p} />
      <Divider horizontalInset style={styles.divider} />

      <RiskRating proposal={p} style={styles.riskLabel} />

      <TransactionActions proposal={p} user={data.user} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  riskLabel: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default withSuspense(TransactionScreen, <ScreenSkeleton />);
