import { Proposal } from '@api/proposal';
import { useToggle } from '@hook/useToggle';
import { materialCommunityIcon } from '@theme/icons';
import { Operation } from 'lib';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-paper';
import { Button } from '~/components/Button';
import { Chevron } from '~/components/Chevron';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { useOperationLabel } from '~/components/call/useOperationLabel';
import { ListItem } from '~/components/list/ListItem';
import { TransferOperationSection } from './TransferOperationSection';

const DataIcon = materialCommunityIcon('code-tags');

export interface OperationSectionProps {
  proposal: Proposal;
  op: Operation;
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
        <ListItem
          leading={op.to}
          overline={op.data ? 'Contract' : 'To'}
          headline={useAddressLabel(op.to)}
        />

        <TransferOperationSection op={op} />

        <Button mode="outlined" icon={DataIcon} style={styles.dataButton}>
          Data
        </Button>
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
