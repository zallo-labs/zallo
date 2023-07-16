import { makeStyles } from '@theme/makeStyles';
import { ScrollView } from 'react-native';
import { FiatValue } from '~/components/fiat/FiatValue';
import { ListHeader } from '~/components/list/ListHeader';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from './Tabs';
import { FeeToken } from './FeeToken';
import { OperationSection } from './OperationSection';
import { Hex, asBigInt } from 'lib';
import { gql, useFragment } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { DetailsTabQuery, DetailsTabQueryVariables } from '@api/gen/graphql';
import { useDetailsTabSubscriptionSubscription } from '@api/generated';

const QueryDoc = gql(/* GraphQL */ `
  query DetailsTab($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
      ...DetailsTab_TransactionProposalFragment
    }
  }
`);

const FragmentDoc = gql(/* GraphQL */ `
  fragment DetailsTab_TransactionProposalFragment on TransactionProposal {
    id
    account {
      id
      address
    }
    operations {
      ...OperationSection_OperationFragment
    }
    transaction {
      id
      receipt {
        id
        transferEvents {
          id
          token
          amount
          value
        }
      }
    }
    simulation {
      id
      transfers {
        id
        token
        amount
        value
      }
    }
    ...OperationSection_TransactionProposalFragment
    ...FeeToken_TransactionProposalFragment
  }
`);

gql(/* GraphQL */ `
  subscription DetailsTabSubscription($proposal: Bytes32!) {
    proposal(input: { proposals: [$proposal] }) {
      ...DetailsTab_TransactionProposalFragment
    }
  }
`);

export interface DetailsTabParams {
  proposal: Hex;
}

export type DetailsTabProps = TabNavigatorScreenProp<'Details'>;

export const DetailsTab = withSuspense(({ route }: DetailsTabProps) => {
  const styles = useStyles();

  const { data } = useSuspenseQuery<DetailsTabQuery, DetailsTabQueryVariables>(QueryDoc, {
    variables: { proposal: route.params.proposal },
  });
  useDetailsTabSubscriptionSubscription({ variables: { proposal: route.params.proposal } });
  const p = useFragment(FragmentDoc, data?.proposal);

  if (!p) return null;

  const transfers = [...(p.transaction?.receipt?.transferEvents ?? p.simulation.transfers)];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {p.operations.map((operation, i) => (
        <OperationSection
          key={i}
          proposal={p}
          operation={operation}
          initiallyExpanded={p.operations.length === 1}
        />
      ))}

      <ListHeader
        trailing={({ Text }) => (
          <Text>
            <FiatValue value={transfers.reduce((sum, t) => sum + asBigInt(t.value), 0n)} />
          </Text>
        )}
      >
        Transfers
      </ListHeader>
      <FeeToken proposal={p} />

      {transfers.map((t, i) => (
        <TokenItem key={i} account={p.account.address} token={t.token} amount={t.amount} />
      ))}
    </ScrollView>
  );
}, TabScreenSkeleton);

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  transfersHeaderSupporting: {
    color: colors.onSurfaceVariant,
  },
}));
