import { useMemo } from 'react';
import { Approval, Submission, Tx } from '~/queries/tx';
import { ApprovalRow } from './ApprovalRow';
import { SubmissionRow } from './SubmissionRow';
import { Container } from '@components/list/Container';
import { Box } from '@components/Box';

enum EventType {
  Approval,
  Submission,
}

export interface Event {
  _type: EventType;
  item: Approval | Submission;
}

const EventComponent = ({ event }: { event: Event }): JSX.Element => {
  switch (event._type) {
    case EventType.Approval:
      return <ApprovalRow approval={event.item as Approval} />;
    case EventType.Submission:
      return <SubmissionRow submission={event.item as Submission} />;
  }
};

export interface TransactionEventsProps {
  tx: Tx;
}

export const TransactionEvents = ({ tx }: TransactionEventsProps) => {
  const events = useMemo(
    (): Event[] =>
      [
        ...tx.approvals.map((item) => ({
          item,
          _type: EventType.Approval,
        })),
        ...tx.submissions.map((item) => ({
          item,
          _type: EventType.Submission,
        })),
      ].sort((a, b) => a.item.timestamp.diff(b.item.timestamp).milliseconds),
    [tx],
  );

  return (
    <Container separator={<Box my={2} />}>
      {events.map((event, i) => (
        <EventComponent key={i} event={event} />
      ))}
    </Container>
  );
};
