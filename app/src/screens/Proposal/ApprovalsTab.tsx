import { isRemoval, usePolicy } from '@api/policy';
import { ProposalId, useProposal } from '@api/proposal';
import { ApprovalsRule } from 'lib';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { ApprovalActions } from './ApprovalActions';
import { TabNavigatorScreenProp } from './Tabs';

export interface ApprovalsTabParams {
  proposal: ProposalId;
}

export type ApprovalsTabProps = TabNavigatorScreenProp<'Approvals'>;

export const ApprovalsTab = ({ route }: ApprovalsTabProps) => {
  const proposal = useProposal(route.params.proposal);
  const policyRules = usePolicy(proposal.satisfiablePolicies[0])?.active;

  if (!policyRules || isRemoval(policyRules)) return null;

  const requiredApproval = policyRules.rules.get(ApprovalsRule)?.approvers ?? new Set();
  const awaitingApproval = [...requiredApproval].filter(
    (a) => !proposal.approvals.has(a) && !proposal.rejections.has(a),
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <ApprovalActions proposal={proposal} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
