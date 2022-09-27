import { useMemo } from 'react';
import { Approval, Submission } from '~/queries/proposal';
import { ApprovalRow } from './ApprovalRow';
import { SubmissionRow } from './SubmissionRow';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ApprovalsRequiredRow } from './ApprovalsRequiredRow';
import { useTransactionIsApproved } from '../useTransactionIsApproved';
import { useTxContext } from '../../TransactionProvider';
import { ProposalRow } from './ProposalRow';

enum EventType {
  Proposal,
  Approval,
  Submission,
}

export type Event =
  | {
      _type: EventType.Proposal | EventType.Approval;
      item: Approval;
    }
  | {
      _type: EventType.Submission;
      item: Submission;
    };

const EventComponent = ({ event }: { event: Event }): JSX.Element => {
  switch (event._type) {
    case EventType.Proposal:
      return <ProposalRow approval={event.item} />;
    case EventType.Approval:
      return <ApprovalRow approval={event.item} />;
    case EventType.Submission:
      return <SubmissionRow submission={event.item} />;
  }
};

export const TransactionEvents = () => {
  const { proposal, proposer } = useTxContext();
  const isApproved = useTransactionIsApproved(proposal, proposer);

  const events = useMemo(
    (): Event[] =>
      [
        ...proposal.approvals.map(
          (item): Event => ({
            item,
            _type:
              item.addr === proposer.addr
                ? EventType.Proposal
                : EventType.Approval,
          }),
        ),
        ...proposal.submissions.map(
          (item): Event => ({
            item,
            _type: EventType.Submission,
          }),
        ),
      ].sort((a, b) => a.item.timestamp.diff(b.item.timestamp).milliseconds),
    [proposal.approvals, proposal.submissions, proposer.addr],
  );

  return (
    <Container separator={<Box mt={1} />}>
      {events.map((event, i) => (
        <EventComponent key={i} event={event} />
      ))}

      {!isApproved && (
        <ApprovalsRequiredRow proposal={proposal} proposer={proposer} />
      )}
    </Container>
  );
};
