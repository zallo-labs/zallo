import { Timestamp } from '#/format/Timestamp';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { DELAY_ENTRIES } from '#/policy/DelaySettings';
import { CancelIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { IconButton } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { P, match } from 'ts-pattern';
import { useMutation } from '~/api';
import { ScheduleSection_cancelMutation } from '~/api/__generated__/ScheduleSection_cancelMutation.graphql';
import { ScheduleSection_transaction$key } from '~/api/__generated__/ScheduleSection_transaction.graphql';
import { logError } from '~/util/analytics';

const DelayIcon = materialCommunityIcon('timer-outline');
const ScheduledIcon = materialCommunityIcon('calendar-month');
const CancelledIcon = materialCommunityIcon('calendar-remove');

const Transaction = graphql`
  fragment ScheduleSection_transaction on Transaction {
    id
    status
    account {
      id
      address
    }
    policy {
      id
      delay
    }
    result {
      __typename
      id
      ... on Scheduled {
        scheduledFor
        cancelled
      }
    }
  }
`;

const CancelScheduledTx = graphql`
  mutation ScheduleSection_cancelMutation($input: ProposeCancelScheduledTransactionInput!) {
    proposeCancelScheduledTransaction(input: $input) {
      id
    }
  }
`;

export interface ScheduleSectionProps {
  children?: ReactNode;
  transaction: ScheduleSection_transaction$key;
}

export function ScheduleSection({ children, ...props }: ScheduleSectionProps) {
  const p = useFragment(Transaction, props.transaction);
  const router = useRouter();
  const proposeCancelScheduledTx = useMutation<ScheduleSection_cancelMutation>(CancelScheduledTx);

  const delay = p.policy.delay;

  if (!delay || (p.result && p.result.__typename !== 'Scheduled')) return;

  return (
    <>
      {match(p.result)
        .with(P.nullish, () => (
          <>
            <ListHeader>Delay</ListHeader>
            <ListItem
              leading={DelayIcon}
              leadingSize="medium"
              headline={`${DELAY_ENTRIES.find((e) => e.value === delay)?.title ?? `${delay} seconds`} from approval`}
            />
          </>
        ))
        .with({ cancelled: false }, (t) => (
          <>
            <ListHeader>Scheduled to execute</ListHeader>
            <ListItem
              leading={ScheduledIcon}
              leadingSize="medium"
              headline={<Timestamp timestamp={t.scheduledFor!} time />}
              trailing={(props) => (
                <IconButton
                  {...props}
                  mode="contained"
                  icon={CancelIcon}
                  onPress={async () => {
                    const id = (
                      await proposeCancelScheduledTx({
                        input: { account: p.account.address, proposal: p.id },
                      })
                    ).proposeCancelScheduledTransaction.id;

                    router.push({
                      pathname: '/(nav)/[account]/(home)/activity/transaction/[id]',
                      params: { account: p.account.address, id },
                    });
                  }}
                />
              )}
            />
          </>
        ))
        .with({ cancelled: true }, (t) => (
          <>
            <ListHeader>Scheduled execution cancelled</ListHeader>
            <ListItem
              leading={CancelledIcon}
              leadingSize="medium"
              headline={({ Text }) => (
                <Text style={styles.strike}>
                  <Timestamp timestamp={t.scheduledFor!} time />
                </Text>
              )}
            />
          </>
        ))
        .otherwise((result) => {
          logError('Unexpected transaction status', { result });
          return null;
        })}

      {children}
    </>
  );
}

const styles = createStyles({
  strike: {
    textDecorationLine: 'line-through',
  },
});
