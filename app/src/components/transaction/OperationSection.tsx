import { useToggle } from '~/hooks/useToggle';
import Collapsible from 'react-native-collapsible';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { OperationDetails } from './OperationDetails';
import { OperationLabel } from '#/transaction/OperationLabel';
import { OperationIcon } from '#/transaction/OperationIcon';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { OperationSection_transaction$key } from '~/api/__generated__/OperationSection_transaction.graphql';
import { OperationSection_operation$key } from '~/api/__generated__/OperationSection_operation.graphql';

const Transaction = graphql`
  fragment OperationSection_transaction on Transaction {
    account {
      id
      address
      chain
    }
  }
`;

const Operation = graphql`
  fragment OperationSection_operation on Operation {
    ...OperationIcon_operation
    ...OperationLabel_operation
    ...OperationDetails_operation
  }
`;

export interface OperationSectionProps {
  transaction: OperationSection_transaction$key;
  operation: OperationSection_operation$key;
}

export function OperationSection(props: OperationSectionProps) {
  const proposal = useFragment(Transaction, props.transaction);
  const op = useFragment(Operation, props.operation);

  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <>
      <ListItem
        leading={<OperationIcon operation={op} chain={proposal.account.chain} />}
        leadingSize="medium"
        headline={<OperationLabel operation={op} chain={proposal.account.chain} />}
        trailing={() => <Chevron expanded={expanded} />}
        onPress={toggleExpanded}
      />

      <Collapsible collapsed={!expanded}>
        <OperationDetails account={proposal.account.address} operation={op} />

        {/* <Button mode="outlined" icon={materialCommunityIcon('code-tags')}>
          Data
        </Button> */}
      </Collapsible>
    </>
  );
}
