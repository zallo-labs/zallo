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
import { Address, Hex } from 'lib';
import { gql, useFragment } from '@api/generated';
import { Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { BOOTLOADER_FORMAL_ADDRESS } from 'zksync-web3/build/src/utils';

const Query = gql(/* GraphQL */ `
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
          tokenAddress
          token {
            ...TokenItem_token
          }
          amount
          value
          from
          to
        }
      }
    }
    simulation {
      id
      transfers {
        id
        tokenAddress
        token {
          ...TokenItem_token
        }
        amount
        value
        from
        to
      }
    }
    ...OperationSection_TransactionProposalFragment
    ...FeeToken_TransactionProposalFragment
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription DetailsTab_Subscription($proposal: Bytes32!) {
    proposal(input: { proposals: [$proposal] }) {
      ...DetailsTab_TransactionProposalFragment
    }
  }
`);

const isFeeTransfer = ({ from, to }: { from: Address; to: Address }) =>
  from !== BOOTLOADER_FORMAL_ADDRESS && to !== BOOTLOADER_FORMAL_ADDRESS;

export interface DetailsTabParams {
  proposal: Hex;
}

export type DetailsTabProps = TabNavigatorScreenProp<'Details'>;

export const DetailsTab = withSuspense(({ route }: DetailsTabProps) => {
  const styles = useStyles();

  const { data } = useQuery(Query, { proposal: route.params.proposal });
  useSubscription({ query: Subscription, variables: { proposal: route.params.proposal } });
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
            <FiatValue value={transfers.reduce((sum, t) => sum + (t.value ?? 0), 0)} />
          </Text>
        )}
      >
        Transfers
      </ListHeader>
      <FeeToken proposal={p} />

      {transfers
        .filter(isFeeTransfer) // Ignore fee transfers, this is shown by FeeToken
        .map((t) =>
          t.token ? (
            <TokenItem key={t.id} token={t.token} amount={t.amount} />
          ) : (
            <Text key={t.id}>{`${t.tokenAddress}: ${t.amount}`}</Text>
          ),
        )}
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
