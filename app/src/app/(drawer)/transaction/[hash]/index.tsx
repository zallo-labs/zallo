import { z } from 'zod';
import { TransactionLayoutParams } from '~/app/(drawer)/transaction/[hash]/_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { StyleSheet, View } from 'react-native';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { gql, useFragment } from '@api/generated';
import { Divider, Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { ProposalValue } from '~/components/proposal/ProposalValue';
import { RiskRating } from '~/components/proposal/RiskRating';
import { FeesSection } from '~/components/transaction/FeesSection';
import { OperationSection } from '~/components/transaction/OperationSection';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

const Query = gql(/* GraphQL */ `
  query TransactionDetailsTab($hash: Bytes32!) {
    transactionProposal(input: { hash: $hash }) {
      ...TransactionDetailsTab_TransactionProposal
    }
  }
`);

const TransactionProposal = gql(/* GraphQL */ `
  fragment TransactionDetailsTab_TransactionProposal on TransactionProposal {
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
            ...TokenItem_Token
          }
          amount
          from
          to
          isFeeTransfer
        }
      }
    }
    simulation {
      id
      transfers {
        id
        tokenAddress
        token {
          ...TokenItem_Token
        }
        amount
        from
        to
        isFeeTransfer
      }
    }
    ...RiskRating_Proposal
    ...OperationSection_TransactionProposalFragment
    ...ProposalValue_TransactionProposal
    ...FeeToken_TransactionProposalFragment
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription TransactionDetailsTab_Subscription($hash: Bytes32!) {
    proposal(input: { proposals: [$hash] }) {
      ...TransactionDetailsTab_TransactionProposal
    }
  }
`);

export const TransactionDetailsTabParams = TransactionLayoutParams;
export type TransactionDetailsTabParams = z.infer<typeof TransactionDetailsTabParams>;

function DetailsTab() {
  const { hash } = useLocalParams(TransactionDetailsTabParams);

  const { data } = useQuery(Query, { hash });
  useSubscription({ query: Subscription, variables: { hash } });
  const p = useFragment(TransactionProposal, data?.transactionProposal);

  if (!p) return null;

  const transfers = [
    ...(p.transaction?.receipt?.transferEvents ?? p.simulation?.transfers ?? []),
  ].filter((t) => !t.isFeeTransfer); // Ignore fee transfers, this is shown by FeeToken

  return (
    <View style={styles.container}>
      <ListHeader>Operations</ListHeader>
      {p.operations.map((operation, i) => (
        <OperationSection
          key={i}
          proposal={p}
          operation={operation}
          initiallyExpanded={p.operations.length === 1}
        />
      ))}
      <Divider horizontalInset style={styles.divider} />

      {transfers.length > 0 && (
        <>
          <ListHeader
            trailing={({ Text }) => (
              <Text>
                <ProposalValue proposal={p} />
              </Text>
            )}
          >
            Transfers
          </ListHeader>

          {transfers.map((t) =>
            t.token ? (
              <TokenItem key={t.id} token={t.token} amount={t.amount} />
            ) : (
              <Text key={t.id}>{`${t.tokenAddress}: ${t.amount}`}</Text>
            ),
          )}
          <Divider horizontalInset style={styles.divider} />
        </>
      )}

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

export default withSuspense(DetailsTab, <ScreenSkeleton />);
