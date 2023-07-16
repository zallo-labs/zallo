import { StyleSheet } from 'react-native';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabBadge } from '~/components/tab/TabBadge';
import { Address } from 'lib';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { ActivityTabBadgeQuery, ActivityTabBadgeQueryVariables } from '@api/gen/graphql';

const QueryDoc = gql(/* GraphQL */ `
  query ActivityTabBadge($accounts: [Address!]!) {
    proposals(input: { accounts: $accounts, statuses: [Pending] }) {
      id
    }
  }
`);

export interface ActivityTabBadgeProps {
  account: Address;
}

export const ActivityTabBadge = withSuspense(
  ({ account }: ActivityTabBadgeProps) => {
    const { proposals } = useSuspenseQuery<ActivityTabBadgeQuery, ActivityTabBadgeQueryVariables>(
      QueryDoc,
      { variables: { accounts: [account] } },
    ).data;

    return <TabBadge value={proposals.length} style={styles.badge} />;
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
