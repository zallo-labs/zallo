import { gql } from '@api/generated';
import { Hex } from 'lib';
import { StyleSheet } from 'react-native';
import { TabBadge } from '~/components/tab/TabBadge';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
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
  const { proposal: p } = useQuery(Query, { proposal: props.proposal }).data;

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
