import { Timestamp } from '#/format/Timestamp';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { DELAY_ENTRIES } from '#/policy/DelaySettings';
import { showError } from '#/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '@api';
import { TransactionProposalStatus } from '@api/documents.generated';
import { CancelIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { IconButton } from 'react-native-paper';
import { P, match } from 'ts-pattern';
import { useMutation } from 'urql';

const DelayIcon = materialCommunityIcon('timer-outline');
const ScheduledIcon = materialCommunityIcon('calendar-month');
const CancelledIcon = materialCommunityIcon('calendar-remove');

const TransactionProposal = gql(/* GraphQL */ `
  fragment ScheduleSection_TransactionProposal on TransactionProposal {
    id
    status
    account {
      id
      address
      policies {
        id
        state {
          id
          delay
        }
      }
    }
    policy {
      id
    }
    transaction {
      id
      scheduledFor
      cancelled
    }
  }
`);

const CancelScheduledTx = gql(/* GraphQL */ `
  mutation ScheduleSection_CancelScheduledTx($input: ProposeCancelScheduledTransactionInput!) {
    proposeCancelScheduledTransaction(input: $input) {
      id
    }
  }
`);

const DISPLAY_STATUSES: TransactionProposalStatus[] = [
  'Pending',
  'Scheduled',
  'Executing',
  'Cancelled',
];

export interface ScheduleSectionProps {
  children?: ReactNode;
  proposal: FragmentType<typeof TransactionProposal>;
}

export function ScheduleSection({ children, ...props }: ScheduleSectionProps) {
  const p = useFragment(TransactionProposal, props.proposal);
  const router = useRouter();
  const proposeCancelScheduledTx = useMutation(CancelScheduledTx)[1];

  const delay = p.account.policies.find((policy) => !p.policy || policy.id === p.policy.id)?.state
    ?.delay;

  if (!delay || !DISPLAY_STATUSES.includes(p.status)) return;

  return (
    <>
      {match(p.transaction)
        .with(P.union(P.nullish, { scheduledFor: P.nullish }), () => (
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
                    ).data?.proposeCancelScheduledTransaction.id;
                    if (!id) return showError('Failed to propose to cancel scheduled transaction');

                    router.push({ pathname: '/(drawer)/transaction/[id]', params: { id } });
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
        .exhaustive()}

      {children}
    </>
  );
}

const styles = createStyles({
  strike: {
    textDecorationLine: 'line-through',
  },
});
