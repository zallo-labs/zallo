import { usePolicy, WPolicy } from '@api/policy';
import { Proposal, useProposal } from '@api/proposal';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { TabNavigatorScreenProp } from './Tabs';
import { TabBadge } from '~/components/tab/TabBadge';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { SelectedPolicy } from './SelectedPolicy';
import { Text } from 'react-native-paper';
import { makeStyles } from '@theme/makeStyles';
import { Hex } from 'lib';

const getApprovalsAwaiting = (proposal: Proposal, policy?: WPolicy) => {
  const state = policy?.state;
  const approvals = [...proposal.approvals].filter((a) => state?.approvers.has(a.approver));

  return state && approvals.length < state.threshold
    ? [...state.approvers].filter((a) => !proposal.approvals.has(a) && !proposal.rejections.has(a))
    : [];
};

export interface PolicyTabParams {
  proposal: Hex;
}

export type PolicyTabProps = TabNavigatorScreenProp<'Policy'>;

export const PolicyTab = withSuspense(({ route }: PolicyTabProps) => {
  const styles = uesStyles();
  const proposal = useProposal(route.params.proposal);
  const policy = usePolicy(proposal.policy);

  const awaitingApproval = getApprovalsAwaiting(proposal, policy);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SelectedPolicy proposal={proposal} policy={policy} />

      {proposal.policy?.unsatisfiable && (
        <Text style={styles.unsatisfiable}>
          Policy lacks permission to execute this transaction
        </Text>
      )}

      {proposal.rejections.size > 0 && <ListHeader>Rejected</ListHeader>}
      {[...proposal.rejections].map((rejection) => (
        <ListItem
          key={rejection.approver}
          leading={rejection.approver}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={rejection.approver} />
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
          key={approval.approver}
          leading={approval.approver}
          headline={({ Text }) => (
            <Text>
              <AddressLabel address={approval.approver} />
            </Text>
          )}
          trailing={({ Text }) => (
            <Text>
              <Timestamp timestamp={approval.timestamp} />
            </Text>
          )}
        />
      ))}
    </ScrollView>
  );
}, TabScreenSkeleton);

const uesStyles = makeStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    paddingTop: 8,
  },
  unsatisfiable: {
    color: colors.error,
    margin: 16,
  },
}));

export interface PolicyTabBadgeProps {
  proposal: Hex;
}

export const PolicyTabBadge = ({ proposal: id }: PolicyTabBadgeProps) => {
  const proposal = useProposal(id);
  const policy = usePolicy(proposal.policy);

  return (
    <TabBadge value={getApprovalsAwaiting(proposal, policy).length} style={badgeStyles.badge} />
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    transform: [{ translateX: -10 }],
  },
});
