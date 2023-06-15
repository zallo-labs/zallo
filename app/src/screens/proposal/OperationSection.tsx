import { Proposal, ProposalOperation } from '@api/proposal';
import { useToggle } from '@hook/useToggle';
import { materialCommunityIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-paper';
import { Button } from '~/components/Button';
import { Chevron } from '~/components/Chevron';
import { useOperationLabel } from '~/components/call/useOperationLabel';
import { ListItem } from '~/components/list/ListItem';
import { OperationDetails } from './OperationDetails';

const DataIcon = materialCommunityIcon('code-tags');

export interface OperationSectionProps {
  proposal: Proposal;
  op: ProposalOperation;
  initiallyExpanded?: boolean;
}

export function OperationSection({
  proposal,
  op,
  initiallyExpanded = false,
}: OperationSectionProps) {
  const [expanded, toggleExpanded] = useToggle(initiallyExpanded);

  return (
    <>
      <ListItem
        leading={op.to}
        headline={useOperationLabel(proposal, op)}
        trailing={() => <Chevron expanded={expanded} />}
        onPress={toggleExpanded}
      />

      <Collapsible collapsed={!expanded}>
        <OperationDetails account={proposal.account} op={op} />

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
