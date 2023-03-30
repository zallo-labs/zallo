import { usePolicy } from '@api/policy';
import { ProposalId, useProposal } from '@api/proposal';
import { NavigateNextIcon } from '@theme/icons';
import { ApprovalsRule } from 'lib';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { showError } from '~/provider/SnackbarProvider';
import { ApprovalActions } from './ApprovalActions';
import { TabNavigatorScreenProp } from './Tabs';

export interface PolicyTabParams {
  proposal: ProposalId;
}

export type PolicyTabProps = TabNavigatorScreenProp<'Policy'>;

export const PolicyTab = ({ route }: PolicyTabProps) => {
  const proposal = useProposal(route.params.proposal);
  const policy = usePolicy(proposal.satisfiablePolicies[0]);
  const policyRules = policy?.active;

  const requiredApproval = policyRules?.rules.get(ApprovalsRule)?.approvers ?? new Set();
  const awaitingApproval = [...requiredApproval].filter(
    (a) => !proposal.approvals.has(a) && !proposal.rejections.has(a),
  );

  const selectPolicy = () => {
    // TODO: allow for policy selection
    showError('Changing preferred execution policy is not yet supported');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {policy ? (
        <ListItem
          headline={policy.name}
          supporting="Only satisfiable policy"
          {...(proposal.satisfiablePolicies.length > 1 && {
            supporting: `${proposal.satisfiablePolicies.length} policies are satisfiable`,
            trailing: (props) => <NavigateNextIcon {...props} onPress={selectPolicy} />,
          })}
        />
      ) : (
        <ListItem headline="No satisfiable policy" />
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

      <ApprovalActions proposal={proposal} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
