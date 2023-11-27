import { z } from 'zod';
import { TransactionLayoutParams } from '~/app/(drawer)/transaction/[hash]/_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { StyleSheet, View } from 'react-native';
import { ListHeader } from '~/components/list/ListHeader';
import { TokenItem } from '~/components/token/TokenItem';
import { Address } from 'lib';
import { gql, useFragment } from '@api/generated';
import { Divider, Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { utils as zksyncUtils } from 'zksync2-js';
import { ProposalValue } from '~/components/proposal/ProposalValue';
import { RiskRating } from '~/components/proposal/RiskRating';
import { FeeToken } from '~/components/transaction/FeeToken';
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

const isFeeTransfer = ({ from, to }: { from: Address; to: Address }) =>
  from !== zksyncUtils.BOOTLOADER_FORMAL_ADDRESS && to !== zksyncUtils.BOOTLOADER_FORMAL_ADDRESS;

export const TransactionDetailsTabParams = TransactionLayoutParams;
export type TransactionDetailsTabParams = z.infer<typeof TransactionDetailsTabParams>;

function DetailsTab() {
  const { hash } = useLocalParams(TransactionDetailsTabParams);

  const { data } = useQuery(Query, { hash });
  useSubscription({ query: Subscription, variables: { hash } });
  const p = useFragment(TransactionProposal, data?.transactionProposal);

  if (!p) return null;

  const transfers = [...(p.transaction?.receipt?.transferEvents ?? p.simulation?.transfers ?? [])];

  return (
    <View style={styles.container}>
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
