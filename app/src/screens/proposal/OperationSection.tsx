import { useToggle } from '@hook/useToggle';
import { materialCommunityIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-paper';
import { Chevron } from '~/components/Chevron';
import { ListItem } from '~/components/list/ListItem';
import { OperationDetails } from './OperationDetails';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from '~/components/call/OperationLabel';

const ProposalFragmentDoc = gql(/* GraphQL */ `
  fragment OperationSection_TransactionProposalFragment on TransactionProposal {
    account {
      id
      address
    }
  }
`);

const OperationFragmentDoc = gql(/* GraphQL */ `
  fragment OperationSection_OperationFragment on Operation {
    to
    ...OperationLabel_OperationFragment
    ...OperationDetails_OperationFragment
  }
`);

const DataIcon = materialCommunityIcon('code-tags');

export interface OperationSectionProps {
  proposal: FragmentType<typeof ProposalFragmentDoc>;
  operation: FragmentType<typeof OperationFragmentDoc>;
  initiallyExpanded?: boolean;
}

export function OperationSection({
  proposal: proposalFragment,
  operation: operationFragment,
  initiallyExpanded = false,
}: OperationSectionProps) {
  const proposal = useFragment(ProposalFragmentDoc, proposalFragment);
  const operation = useFragment(OperationFragmentDoc, operationFragment);

  const [expanded, toggleExpanded] = useToggle(initiallyExpanded);

  return (
    <>
      <ListItem
        leading={operation.to}
        headline={({ Text }) => (
          <Text>
            <OperationLabel operation={operation} />
          </Text>
        )}
        trailing={() => <Chevron expanded={expanded} />}
        onPress={toggleExpanded}
      />

      <Collapsible collapsed={!expanded}>
        <OperationDetails account={proposal.account.address} operation={operation} />

        {/* TODO: user can swap tokens in-app (ZAL-137) */}
        {/* <Button mode="outlined" icon={DataIcon} style={styles.dataButton}>
          Data
        </Button> */}
      </Collapsible>

      <Divider horizontalInset style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  dataButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    marginVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
});
