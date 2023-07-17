import { gql } from '@api/gen';
import { PolicyTabBadgeQuery, PolicyTabBadgeQueryVariables } from '@api/gen/graphql';
import { useSuspenseQuery } from '@apollo/client';
import { Hex } from 'lib';
import { StyleSheet } from 'react-native';
import { TabBadge } from '~/components/tab/TabBadge';

const QueryDoc = gql(/* GraphQL */ `
  query TransactionTabBadge($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
      id
      status
    }
  }
`);

export interface TransactionTabBadgeProps {
  proposal: Hex;
}

export function TransactionTabBadge(props: TransactionTabBadgeProps) {
  const { proposal: p } = useSuspenseQuery<PolicyTabBadgeQuery, PolicyTabBadgeQueryVariables>(
    QueryDoc,
    { variables: { proposal: props.proposal } },
  ).data;

  if (!p) return null;

  return (
    <TabBadge visible={p.status === 'Executing' || p.status === 'Failed'} style={styles.badge} />
  );
}

const styles = StyleSheet.create({
  badge: {
    transform: [{ translateX: -8 }],
  },
});
