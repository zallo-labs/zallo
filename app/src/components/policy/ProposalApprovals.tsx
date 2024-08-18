import { ListHeader } from '#/list/ListHeader';
import { UUID } from 'lib';
import { ApprovalItem } from '#/transaction/ApprovalItem';
import { SelectedPolicy } from '#/transaction/SelectedPolicy';
import { PendingApprovalItem } from '#/transaction/PendingApprovalItem';
import { RejectionItem } from '#/transaction/RejectionItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { useMemo } from 'react';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { graphql } from 'relay-runtime';
import { useFragment, useSubscription } from 'react-relay';
import { ProposalApprovalsQuery } from '~/api/__generated__/ProposalApprovalsQuery.graphql';
import { ProposalApprovals_proposal$key } from '~/api/__generated__/ProposalApprovals_proposal.graphql';
import { useLazyQuery } from '~/api';
import { ItemListSubheader } from '#/list/ItemListSubheader';
import { ItemList } from '#/layout/ItemList';
import { createStyles, useStyles } from '@theme/styles';
import { ProposalApprovals_Subscription } from '~/api/__generated__/ProposalApprovals_Subscription.graphql';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

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
  query ProposalApprovalsQuery($id: ID!) {
    proposal(id: $id) {
      ...ProposalApprovals_proposal
    }

    user {
      ...PendingApprovalItem_user
      ...RejectionItem_user
      ...ApprovalItem_user
    }
  }
`;

const Subscription = graphql`
  subscription ProposalApprovals_Subscription($id: ID!) {
    proposalUpdated(input: { proposals: [$id], events: [approval, rejection] }) {
      id
      event
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
  const { styles } = useStyles(stylesheet);

  const { user, ...query } = useLazyQuery<ProposalApprovalsQuery>(Query, { id });
  const p = useFragment<ProposalApprovals_proposal$key>(Proposal, query.proposal);

  useSubscription<ProposalApprovals_Subscription>(
    useMemo(() => ({ subscription: Subscription, variables: { id } }), [id]),
  );

  if (!p) return null;

  const pendingApprovers =
    p.approvals.length < p.policy.threshold &&
    p.policy.approvers.filter(
      (approver) =>
        !p.approvals.find((a) => a.approver.id === approver.id) &&
        !p.rejections.find((r) => r.approver.id === approver.id),
    );

  return (
    <>
      <SelectedPolicy proposal={p} />

      {pendingApprovers && (
        <>
          <View style={styles.pendingLabelContainer}>
            <ItemListSubheader>Pending</ItemListSubheader>

            <Text variant="bodyMedium">{p.policy.threshold - p.approvals.length} required</Text>
          </View>

          <ItemList>
            {pendingApprovers.map((approver) => (
              <PendingApprovalItem
                key={approver.id}
                user={user}
                proposal={p}
                approver={approver}
                containerStyle={[styles.item, styles.pending]}
              />
            ))}
          </ItemList>
        </>
      )}

      {p.approvals.length > 0 && (
        <>
          <ItemListSubheader>Approvals</ItemListSubheader>
          <ItemList>
            {p.approvals.map((a) => (
              <ApprovalItem
                key={a.id}
                user={user}
                approval={a}
                proposal={p}
                containerStyle={styles.item}
              />
            ))}
          </ItemList>
        </>
      )}

      {p.rejections.length > 0 && (
        <>
          <ItemListSubheader>Rejected</ItemListSubheader>
          <ItemList>
            {p.rejections.map((rejection) => (
              <RejectionItem
                key={rejection.id}
                user={user}
                rejection={rejection}
                proposal={p}
                containerStyle={styles.item}
              />
            ))}
          </ItemList>
        </>
      )}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
  pending: {
    paddingVertical: 16,
  },
  pendingLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginRight: 24,
  },
}));

export const ProposalApprovals = withSuspense(
  ProposalApprovals_,
  <ListItemSkeleton leading supporting trailing />,
);
