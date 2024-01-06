import { View } from 'react-native';
import { useSubscription } from 'urql';

import { UUID } from 'lib';
import { ListHeader } from '~/components/list/ListHeader';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ApprovalItem } from '~/components/transaction/ApprovalItem';
import { AwaitingApprovalItem } from '~/components/transaction/AwaitingApprovalItem';
import { RejectionItem } from '~/components/transaction/RejectionItem';
import { SelectedPolicy } from '~/components/transaction/SelectedPolicy';
import { getOptimizedDocument, useQuery } from '~/gql';
import { gql, useFragment } from '~/gql/api/generated';
import { createStyles, useStyles } from '~/util/theme/styles';

const Proposal = gql(/* GraphQL */ `
  fragment ProposalApprovals_Proposal on Proposal
  @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    account {
      id
      policies {
        id
        satisfiability(input: { proposal: $proposal }) {
          result
        }
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
    }
    policy {
      id
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
    ...SelectedPolicy_ProposalFragment @arguments(proposal: $proposal)
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
  const { styles } = useStyles(stylesheet);

  const { data } = useQuery(Query, { proposal: id });
  useSubscription({
    query: getOptimizedDocument(Subscription),
    variables: { proposal: id },
  });
  const p = useFragment(Proposal, data.proposal);
  const user = data.user;

  if (!p) return null;

  const selected =
    p.account.policies.find(({ id }) => id === p.policy?.id) ?? p.account.policies[0];

  const awaitingApproval = p.approvals.length < (selected.state?.threshold ?? 0);
  const awaitingApprovers = selected.state?.approvers.filter(
    (approver) =>
      !p.approvals.find((a) => a.approver.id === approver.id) &&
      !p.rejections.find((r) => r.approver.id === approver.id),
  );

  return (
    <View style={styles.container}>
      <SelectedPolicy proposal={p} />

      {awaitingApproval && (
        <>
          <ListHeader>Awaiting</ListHeader>
          {awaitingApprovers?.map((approver) => (
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
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  unsatisfiable: {
    color: colors.error,
    margin: 16,
  },
}));

export const ProposalApprovals = withSuspense(ProposalApprovals_, <ScreenSkeleton />);
