import { useMemo } from 'react';
import { Approval, Submission, Tx } from '~/queries/tx';
import { ApprovalRow } from './ApprovalRow';
import { SubmissionRow } from './SubmissionRow';
import { Container } from '@components/list/Container';
import { Box } from '@components/Box';
import { ExecutedRow } from './ExecutedRow';
import { isPresent } from 'lib';

enum EventType {
  Approval,
  Submission,
  Executed,
}

export interface Event {
  _type: EventType;
  item: Approval | Submission | Tx;
}

const EventComponent = ({ event }: { event: Event }): JSX.Element => {
  switch (event._type) {
    case EventType.Approval:
      return <ApprovalRow approval={event.item as Approval} />;
    case EventType.Submission:
      return <SubmissionRow submission={event.item as Submission} />;
    case EventType.Executed:
      return <ExecutedRow tx={event.item as Tx} />;
  }
};

export interface TransactionEventsProps {
  tx: Tx;
}

export const TransactionEvents = ({ tx }: TransactionEventsProps) => {
  const events = useMemo((): Event[] => {
    return [
      ...tx.approvals.map((item) => ({
        item,
        _type: EventType.Approval,
      })),
      ...tx.submissions.map((item) => ({
        item,
        _type: EventType.Submission,
      })),
      tx.status === 'executed'
        ? {
            item: tx,
            _type: EventType.Executed,
          }
        : undefined,
    ]
      .filter(isPresent)
      .sort(
        (a, b) => a.item.timestamp.millisecond - b.item.timestamp.millisecond,
      );
  }, [tx]);

  return (
    <Container separator={<Box my={2} />}>
      {events.map((event, i) => (
        <EventComponent key={i} event={event} />
      ))}
    </Container>
  );
};
