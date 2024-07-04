import { ListHeader } from '#/list/ListHeader';
import { UUID } from 'lib';
import { ApprovalItem } from '#/transaction/ApprovalItem';
import { SelectedPolicy } from '#/transaction/SelectedPolicy';
import { PendingApprovalItem } from '#/transaction/PendingApprovalItem';
import { RejectionItem } from '#/transaction/RejectionItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { memo, useMemo } from 'react';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { graphql } from 'relay-runtime';
import { useFragment, useLazyLoadQuery, useSubscription } from 'react-relay';
import { ProposalApprovalsQuery } from '~/api/__generated__/ProposalApprovalsQuery.graphql';
import { ProposalApprovals_proposal$key } from '~/api/__generated__/ProposalApprovals_proposal.graphql';

const Proposal = graphql`
  fragment ProposalApprovals_proposal on Proposal {
    id
    policy {
      id
      threshold
      approvers {
        id
        address
        ...PendingApprovalItem_approver
      }
    }
    rejections {
      id
      approver {
        id
      }
      ...RejectionItem_rejection
    }
    approvals {
      id
      approver {
        id
        address
      }
      ...ApprovalItem_approval
    }
    createdAt
    proposedBy {
      id
      address
    }
    ...SelectedPolicy_proposal
    ...PendingApprovalItem_proposal
    ...RejectionItem_proposal
    ...ApprovalItem_proposal
  }
`;

const Query = graphql`
  query ProposalApprovalsQuery($proposal: ID!) {
    proposal(input: { id: $proposal }) {
      id
      policy {
        id
        threshold
        approvers {
          id
          address
          ...PendingApprovalItem_approver
        }
      }
      rejections {
        id
        approver {
          id
        }
        ...RejectionItem_rejection
      }
      approvals {
        id
        approver {
          id
          address
        }
        ...ApprovalItem_approval
      }
      createdAt
      proposedBy {
        id
        address
      }
      ...SelectedPolicy_proposal
      ...PendingApprovalItem_proposal
      ...RejectionItem_proposal
      ...ApprovalItem_proposal
    }

    user {
      ...PendingApprovalItem_user
      ...RejectionItem_user
      ...ApprovalItem_user
    }
  }
`;

const Subscription = graphql`
  subscription ProposalApprovals_Subscription($proposal: ID!) {
    proposalUpdated(input: { proposals: [$proposal], events: [approval, rejection] }) {
      id
      proposal {
        ...ProposalApprovals_proposal
      }
    }
  }
`;

export interface PolicyTabProps {
  proposal: UUID;
}

function ProposalApprovals_({ proposal: id }: PolicyTabProps) {
  const data = useLazyLoadQuery<ProposalApprovalsQuery>(Query, { proposal: id });
  // const p = useFragment<ProposalApprovals_proposal$key>(Proposal, data.proposal);
  const p = data.proposal;
  const user = data.user;

  // useSubscription(
  //   useMemo(() => ({ subscription: Subscription, variables: { proposal: id } }), [id]),
  // );

  if (!p) return null;

  const awaitingApprovers =
    p.policy &&
    p.approvals.length < p.policy.threshold &&
    p.policy.approvers.filter(
      (approver) =>
        !p.approvals.find((a) => a.approver.id === approver.id) &&
        !p.rejections.find((r) => r.approver.id === approver.id),
    );

  return (
    <>
      <SelectedPolicy proposal={p} />

      {awaitingApprovers && (
        <>
          <ListHeader
            trailing={p.policy.threshold && `${p.policy.threshold - p.approvals.length} required`}
          >
            Pending
          </ListHeader>
          {awaitingApprovers.map((approver) => (
            <PendingApprovalItem key={approver.id} user={user} proposal={p} approver={approver} />
          ))}
        </>
      )}

      {p.rejections.length > 0 && <ListHeader>Rejected</ListHeader>}
      {p.rejections.map((rejection) => (
        <RejectionItem key={rejection.id} user={user} rejection={rejection} proposal={p} />
      ))}

      {p.approvals.length > 0 && <ListHeader>Approvals</ListHeader>}
      {p.approvals.map((approval) => {
        console.log({ ProposalApprovals: { approval, proposal: p } });
        return <ApprovalItem key={approval.id} user={user} approval={approval} proposal={p} />;
      })}
    </>
  );
}

export const ProposalApprovals = withSuspense(
  memo(ProposalApprovals_),
  <ListItemSkeleton leading supporting trailing />,
);
