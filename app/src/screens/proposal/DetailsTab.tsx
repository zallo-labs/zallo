import { ScrollView, StyleSheet } from 'react-native';
import { ListHeader } from '~/components/list/ListHeader';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TokenItem } from '~/components/token/TokenItem';
import { TabNavigatorScreenProp } from './Tabs';
import { FeeToken } from './FeeToken';
import { OperationSection } from './OperationSection';
import { Address, Hex } from 'lib';
import { gql, useFragment } from '@api/generated';
import { Divider, Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { BOOTLOADER_FORMAL_ADDRESS } from 'zksync-web3/build/src/utils';
import { ProposalValue } from '~/components/proposal/ProposalValue';
import { RiskRating } from '~/components/proposal/RiskRating';

const Query = gql(/* GraphQL */ `
  query DetailsTab($proposal: Bytes32!) {
    transactionProposal(input: { hash: $proposal }) {
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
        from
        to
      }
    }
    ...RiskRating_Proposal
    ...OperationSection_TransactionProposalFragment
    ...ProposalValue_TransactionProposal
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
  const { data } = useQuery(Query, { proposal: route.params.proposal });
  useSubscription({ query: Subscription, variables: { proposal: route.params.proposal } });
  const p = useFragment(FragmentDoc, data?.transactionProposal);

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

      <Divider horizontalInset style={styles.divider} />

      <ListHeader
        trailing={({ Text }) => (
          <Text>
            <ProposalValue proposal={p} />
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

      <RiskRating proposal={p} style={styles.riskLabel} />
    </ScrollView>
  );
}, TabScreenSkeleton);

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
