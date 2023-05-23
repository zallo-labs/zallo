import { usePolicy, WPolicy } from '@api/policy';
import { Proposal, ProposalId, useProposal } from '@api/proposal';
import { NavigateNextIcon, PolicySatisfiableIcon, PolicyUnsatisfiableIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { showInfo } from '~/provider/SnackbarProvider';
import { ApprovalActions } from './ApprovalActions';
import { TabNavigatorScreenProp } from './Tabs';
import { TabBadge } from '~/components/tab/TabBadge';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';

const getApprovalsAwaiting = (proposal: Proposal, policy?: WPolicy) => {
  const state = policy?.state;
  const approvals = [...proposal.approvals].filter((a) => state?.approvers.has(a.user));

  return state && approvals.length < state.threshold
    ? [...state.approvers].filter((a) => !proposal.approvals.has(a) && !proposal.rejections.has(a))
    : [];
};

export interface PolicyTabParams {
  proposal: ProposalId;
}

export type PolicyTabProps = TabNavigatorScreenProp<'Policy'>;

export const PolicyTab = withSuspense(({ route }: PolicyTabProps) => {
  const proposal = useProposal(route.params.proposal);
  const policy = usePolicy(proposal.satisfiablePolicies[0]);

  const awaitingApproval = getApprovalsAwaiting(proposal, policy);

  const selectPolicy = () => {
    // TODO: allow for policy selection
    showInfo('Changing preferred execution policy is not yet supported');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {policy ? (
        <ListItem
          leading={PolicySatisfiableIcon}
          headline={policy.name}
          supporting="Only satisfiable policy"
          {...(proposal.satisfiablePolicies.length > 1 && {
            supporting: `${proposal.satisfiablePolicies.length} policies are satisfiable`,
            trailing: (props) => <NavigateNextIcon {...props} onPress={selectPolicy} />,
          })}
        />
      ) : (
        <ListItem leading={PolicyUnsatisfiableIcon} headline="No satisfiable policy" />
      )}

      {proposal.rejections.size > 0 && <ListHeader>Rejected</ListHeader>}
      {[...proposal.rejections].map((rejection) => (
        <ListItem
          key={rejection.user}
          leading={rejection.user}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={rejection.user} />
            </Text>
          )}
          supporting="Rejected"
          trailing={({ Text }) => (
            <Text>
              <Timestamp timestamp={rejection.timestamp} />
            </Text>
          )}
        />
      ))}

      {awaitingApproval.length > 0 && <ListHeader>Awaiting approval from</ListHeader>}
      {awaitingApproval.map((approver) => (
        <ListItem
          key={approver}
          leading={approver}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={approver} />
            </Text>
          )}
        />
      ))}

      {proposal.approvals.size > 0 && <ListHeader>Approvals</ListHeader>}
      {[...proposal.approvals].map((approval) => (
        <ListItem
          key={approval.user}
          leading={approval.user}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={approval.user} />
            </Text>
          )}
          trailing={({ Text }) => (
            <Text>
              <Timestamp timestamp={approval.timestamp} />
            </Text>
          )}
        />
      ))}

      <ApprovalActions proposal={proposal} />
    </ScrollView>
  );
}, TabScreenSkeleton);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  badge: {
    transform: [{ translateX: -10 }],
  },
});

export interface PolicyTabBadgeProps {
  proposal: ProposalId;
}

export const PolicyTabBadge = ({ proposal: id }: PolicyTabBadgeProps) => {
  const proposal = useProposal(id);
  const policy = usePolicy(proposal.satisfiablePolicies[0]);

  return <TabBadge value={getApprovalsAwaiting(proposal, policy).length} style={styles.badge} />;
};
