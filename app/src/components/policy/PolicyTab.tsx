import { ScrollView } from 'react-native';
import { ListHeader } from '~/components/list/ListHeader';
import { Hex } from 'lib';
import { gql, useFragment } from '@api/generated';
import { getOptimizedDocument, useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { ApprovalItem } from '~/components/transaction/ApprovalItem';
import { SelectedPolicy } from '~/components/transaction/SelectedPolicy';
import { AwaitingApprovalItem } from '~/components/transaction/AwaitingApprovalItem';
import { RejectionItem } from '~/components/transaction/RejectionItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { createStyles, useStyles } from '@theme/styles';

const Proposal = gql(/* GraphQL */ `
  fragment PolicyTab_ProposalFragment on Proposal
  @argumentDefinitions(proposal: { type: "Bytes32!" }) {
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
  query PolicyTab($proposal: Bytes32!) {
    proposal(input: { hash: $proposal }) {
      ...PolicyTab_ProposalFragment @arguments(proposal: $proposal)
    }

    user {
      ...AwaitingApprovalItem_User
      ...RejectionItem_User
      ...ApprovalItem_User
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription PolicyTab_Subscription($proposal: Bytes32!) {
    proposal(input: { proposals: [$proposal] }) {
      ...PolicyTab_ProposalFragment @arguments(proposal: $proposal)
    }
  }
`);

export interface PolicyTabProps {
  hash: Hex;
}

function PolicyTab_({ hash }: PolicyTabProps) {
  const { styles } = useStyles(stylesheet);

  const { data } = useQuery(Query, { proposal: hash });
  useSubscription({
    query: getOptimizedDocument(Subscription),
    variables: { proposal: hash },
  });
  const p = useFragment(Proposal, data.proposal);
  const user = data.user;

  if (!p) return null;

  const selected =
    p.account.policies.find(({ id }) => id === p.policy?.id) ?? p.account.policies[0];

  const remaining = selected.state && {
    approvals: Math.max(selected.state.threshold - p.approvals.length, 0),
    approvers: selected.state.approvers.filter(
      (approver) =>
        !p.approvals.find((a) => a.approver.id === approver.id) &&
        !p.rejections.find((r) => r.approver.id === approver.id),
    ),
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SelectedPolicy proposal={p} />

      {remaining && remaining.approvals > 0 && (
        <>
          <ListHeader>Awaiting</ListHeader>
          {remaining.approvers.map((approver) => (
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
    </ScrollView>
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

export const PolicyTab = withSuspense(PolicyTab_, <ScreenSkeleton />);
