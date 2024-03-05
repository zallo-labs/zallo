import { ListHeader } from '#/list/ListHeader';
import { UUID } from 'lib';
import { gql, useFragment } from '@api/generated';
import { getOptimizedDocument, useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { ApprovalItem } from '#/transaction/ApprovalItem';
import { SelectedPolicy } from '#/transaction/SelectedPolicy';
import { AwaitingApprovalItem } from '#/transaction/AwaitingApprovalItem';
import { RejectionItem } from '#/transaction/RejectionItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';

const Proposal = gql(/* GraphQL */ `
  fragment ProposalApprovals_Proposal on Proposal
  @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    policy {
      id
      state {
        id
        threshold
        approvers {
          id
          address
          ...AwaitingApprovalItem_Approver
        }
      }
    }
    rejections {
      id
      approver {
        id
      }
      ...RejectionItem_Rejection
    }
    approvals {
      id
      approver {
        id
      }
      ...ApprovalItem_Approval
    }
    createdAt
    proposedBy {
      id
      address
    }
    ...SelectedPolicy_Proposal @arguments(proposal: $proposal)
    ...AwaitingApprovalItem_Proposal
    ...RejectionItem_Proposal
    ...ApprovalItem_Proposal
  }
`);

const Query = gql(/* GraphQL */ `
  query ProposalApprovals($proposal: UUID!) {
    proposal(input: { id: $proposal }) {
      ...ProposalApprovals_Proposal @arguments(proposal: $proposal)
    }

    user {
      ...AwaitingApprovalItem_User
      ...RejectionItem_User
      ...ApprovalItem_User
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription ProposalApprovals_Subscription($proposal: UUID!) {
    proposal(input: { proposals: [$proposal] }) {
      ...ProposalApprovals_Proposal @arguments(proposal: $proposal)
    }
  }
`);

export interface PolicyTabProps {
  proposal: UUID;
}

function ProposalApprovals_({ proposal: id }: PolicyTabProps) {
  const { data } = useQuery(Query, { proposal: id });
  useSubscription({
    query: getOptimizedDocument(Subscription),
    variables: { proposal: id },
  });
  const p = useFragment(Proposal, data.proposal);
  const user = data.user;

  if (!p) return null;

  const awaitingApprovers =
    p.policy.state &&
    p.approvals.length < (p.policy.state?.threshold ?? 0) &&
    p.policy.state.approvers.filter(
      (approver) =>
        !p.approvals.find((a) => a.approver.id === approver.id) &&
        !p.rejections.find((r) => r.approver.id === approver.id),
    );

  return (
    <>
      <SelectedPolicy proposal={p} />

      {awaitingApprovers && (
        <>
          <ListHeader>Awaiting</ListHeader>
          {awaitingApprovers.map((approver) => (
            <AwaitingApprovalItem key={approver.id} user={user} proposal={p} approver={approver} />
          ))}
        </>
      )}

      {p.rejections.length > 0 && <ListHeader>Rejected</ListHeader>}
      {p.rejections.map((rejection) => (
        <RejectionItem key={rejection.id} user={user} rejection={rejection} proposal={p} />
      ))}

      {p.approvals.length > 0 && <ListHeader>Approvals</ListHeader>}
      {p.approvals.map((approval) => (
        <ApprovalItem key={approval.id} user={user} approval={approval} proposal={p} />
      ))}
    </>
  );
}

export const ProposalApprovals = withSuspense(ProposalApprovals_, <ScreenSkeleton />);
