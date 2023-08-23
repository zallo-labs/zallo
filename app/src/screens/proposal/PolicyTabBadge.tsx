import { gql } from '@api/generated';
import { Hex } from 'lib';
import { StyleSheet } from 'react-native';
import { TabBadge } from '~/components/tab/TabBadge';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query PolicyTabBadge($proposal: Bytes32!) {
    transactionProposal(input: { hash: $proposal }) {
      id
      status
      policy {
        id
        satisfiability(input: { proposal: $proposal }) {
          result
        }
      }
    }
  }
`);

export interface PolicyTabBadgeProps {
  proposal: Hex;
}

export function PolicyTabBadge(props: PolicyTabBadgeProps) {
  const { transactionProposal: p } = useQuery(Query, { proposal: props.proposal }).data;

  if (!p) return null;

  return (
    <TabBadge
      visible={
        (p.status === 'Pending' || p.status === 'Failed') &&
        p.policy?.satisfiability.result !== 'satisfied'
      }
      style={styles.badge}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    transform: [{ translateX: -10 }],
  },
});
