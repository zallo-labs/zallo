import { z } from 'zod';
import { TransactionLayoutParams } from '~/app/(drawer)/transaction/[id]/_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { CheckIcon, ClockOutlineIcon, CloseIcon, GasOutlineIcon } from '@theme/icons';
import { ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { match } from 'ts-pattern';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { ReactNode } from 'react';
import { gql, useFragment } from '@api/generated';
import { getOptimizedDocument, useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { createStyles, useStyles } from '@theme/styles';

const TransactionProposal = gql(/* GraphQL */ `
  fragment TransactionTab_TransactionProposalFragment on TransactionProposal {
    id
    status
  }
`);

const Query = gql(/* GraphQL */ `
  query TransactionTab($proposal: UUID!) {
    transactionProposal(input: { id: $proposal }) {
      ...TransactionTab_TransactionProposalFragment
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription TransactionTab_Subscription($proposal: UUID!) {
    proposal(input: { proposals: [$proposal] }) {
      ...TransactionTab_TransactionProposalFragment
    }
  }
`);

const Item = (props: Omit<ListItemProps, 'trailing'> & { trailing: ReactNode }) => (
  <ListItem
    {...props}
    trailing={
      props.trailing ? ({ Text }) => <Text variant="bodyMedium">{props.trailing}</Text> : undefined
    }
  />
);

export const TransactionTabParams = TransactionLayoutParams;
export type TransactionTabParams = z.infer<typeof TransactionTabParams>;

function TransactionTab() {
  const { id } = useLocalParams(TransactionTabParams);
  const { styles } = useStyles(stylesheet);

  const { data } = useQuery(Query, { proposal: id });
  useSubscription({
    query: getOptimizedDocument(Subscription),
    variables: { proposal: id },
  });
  const p = useFragment(TransactionProposal, data?.transactionProposal);

  if (!p) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {match(p)
        .with({ status: 'Pending' }, () => (
          <Item leading={ClockOutlineIcon} headline="Status" trailing="Pending" />
        ))
        .with({ status: 'Executing' }, () => (
          <Item
            leading={({ size }) => <ActivityIndicator size={size} />}
            headline="Status"
            trailing="Executing"
          />
        ))
        .with({ status: 'Successful' }, () => (
          <Item leading={CheckIcon} headline="Status" trailing="Success" />
        ))
        .with({ status: 'Failed' }, () => (
          <ListItem
            leading={CloseIcon}
            headline="Status"
            trailing={({ Text }) => <Text style={styles.failed}>Failed</Text>}
          />
        ))
        .exhaustive()}

      {/* {tx && (
        <Item
          leading={ClockOutlineIcon}
          headline="Submitted"
          trailing={<Timestamp timestamp={tx.submittedAt} />}
        />
      )}

      {receipt && (
        <Item
          leading={ClockOutlineIcon}
          headline="Executed"
          trailing={<Timestamp timestamp={receipt.timestamp} />}
        />
      )}

      <Item
        leading={GasOutlineIcon}
        headline="Gas limit"
        trailing={<FormattedNumber value={p.gasLimit} />}
      />

      {receipt && (
        <Item
          leading={GasOutlineIcon}
          headline="Gas used"
          trailing={<FormattedNumber value={receipt.gasUsed} />}
        />
      )} */}
    </ScrollView>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  failed: {
    color: colors.error,
  },
}));

export default withSuspense(TransactionTab, <ScreenSkeleton />);
