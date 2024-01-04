import { useLocalParams } from '~/hooks/useLocalParams';
import { StyleSheet, View } from 'react-native';
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

const TransactionProposal = gql(/* GraphQL */ `
  fragment TransactionScreen_TransactionProposal on TransactionProposal
  @argumentDefinitions(account: { type: "UAddress!" }, includeAccount: { type: "Boolean!" }) {
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
  }
`);

const Query = gql(/* GraphQL */ `
  query TransactionScreen($id: UUID!, $account: UAddress!, $includeAccount: Boolean!) {
    transactionProposal(input: { id: $id }) {
      ...TransactionScreen_TransactionProposal
        @arguments(account: $account, includeAccount: $includeAccount)
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription TransactionScreen_Subscription(
    $id: UUID!
    $account: UAddress!
    $includeAccount: Boolean!
  ) {
    proposal(input: { proposals: [$id] }) {
      ...TransactionScreen_TransactionProposal
        @arguments(account: $account, includeAccount: $includeAccount)
    }
  }
`);

export const TransactionScreenParams = TransactionLayoutParams;

function TransactionScreen() {
  const { id } = useLocalParams(TransactionScreenParams);

  // Extract account from TransactionProposal result, and use it as a variable to get the full result
  const [account, setAccount] = useState<UAddress>();
  const variables = {
    id,
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
    <View style={styles.container}>
      <OperationsSection proposal={p} />
      <Divider horizontalInset style={styles.divider} />

      <TransfersSection proposal={p}>
        <Divider horizontalInset style={styles.divider} />
      </TransfersSection>

      <FeesSection proposal={p} />
      <Divider horizontalInset style={styles.divider} />

      <RiskRating proposal={p} style={styles.riskLabel} />
    </View>
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
