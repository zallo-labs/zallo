import { Timestamp } from '#/format/Timestamp';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { DELAY_ENTRIES } from '#/policy/DelaySettings';
import { FragmentType, gql, useFragment } from '@api';
import { materialCommunityIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { ReactNode } from 'react';
import { P, match } from 'ts-pattern';

const DelayIcon = materialCommunityIcon('timer-outline');
const ScheduledIcon = materialCommunityIcon('calendar-month');
const CancelledIcon = materialCommunityIcon('calendar-remove');

const TransactionProposal = gql(/* GraphQL */ `
  fragment ScheduleSection_TransactionProposal on TransactionProposal {
    id
    status
    account {
      id
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

export interface ScheduleSectionProps {
  children?: ReactNode;
  proposal: FragmentType<typeof TransactionProposal>;
}

export function ScheduleSection({ children, ...props }: ScheduleSectionProps) {
  const p = useFragment(TransactionProposal, props.proposal);

  const delay = p.account.policies.find((policy) => !p.policy || policy.id === p.policy.id)?.state
    ?.delay;

  if (!delay) return;

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
