import { StyleSheet } from 'react-native';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabBadge } from '~/components/tab/TabBadge';
import { Address } from 'lib';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query ActivityTabBadge($accounts: [Address!]!) {
    transactionProposals(input: { accounts: $accounts, statuses: [Pending] }) {
      id
    }
  }
`);

export interface ActivityTabBadgeProps {
  account: Address;
}

export const ActivityTabBadge = withSuspense(
  ({ account }: ActivityTabBadgeProps) => {
    const { transactionProposals } = useQuery(Query, { accounts: [account] }).data;

    return <TabBadge value={transactionProposals.length} style={styles.badge} />;
  },
  () => null,
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyListText: {
    alignSelf: 'center',
    margin: 16,
  },
  badge: {
    transform: [{ translateX: -10 }],
  },
});
