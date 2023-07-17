import { gql } from '@api/gen';
import { PolicyTabBadgeQuery, PolicyTabBadgeQueryVariables } from '@api/gen/graphql';
import { PolicyTabBadgeDocument } from '@api/generated';
import { useSuspenseQuery } from '@apollo/client';
import { Hex } from 'lib';
import { StyleSheet } from 'react-native';
import { TabBadge } from '~/components/tab/TabBadge';

gql(/* GraphQL */ `
  query PolicyTabBadge($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
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
  const { proposal: p } = useSuspenseQuery<PolicyTabBadgeQuery, PolicyTabBadgeQueryVariables>(
    PolicyTabBadgeDocument,
    { variables: { proposal: props.proposal } },
  ).data;

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
