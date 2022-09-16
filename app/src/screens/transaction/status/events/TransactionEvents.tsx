import { useMemo } from 'react';
import { Approval, Submission, Proposal } from '~/queries/proposal';
import { ApprovalRow } from './ApprovalRow';
import { SubmissionRow } from './SubmissionRow';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ApprovalsRequiredRow } from './ApprovalsRequiredRow';
import { useTransactionIsApproved } from '../useTransactionIsApproved';
import { CombinedWallet } from '~/queries/wallets';

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
  tx: Proposal;
  wallet: CombinedWallet;
}

export const TransactionEvents = ({ tx, wallet }: TransactionEventsProps) => {
  const isApproved = useTransactionIsApproved(tx, wallet);

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
      {!isApproved && <ApprovalsRequiredRow tx={tx} wallet={wallet} />}
    </Container>
  );
};
