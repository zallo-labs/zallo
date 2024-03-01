import { useToggle } from '~/hooks/useToggle';
import Collapsible from 'react-native-collapsible';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { OperationDetails } from './OperationDetails';
import { FragmentType, gql, useFragment } from '@api/generated';
import { OperationLabel } from '#/transaction/OperationLabel';
import { OperationIcon } from '#/transaction/OperationIcon';

const Transaction = gql(/* GraphQL */ `
  fragment OperationSection_Transaction on Transaction {
    account {
      id
      address
      chain
    }
  }
`);

const Operation = gql(/* GraphQL */ `
  fragment OperationSection_Operation on Operation {
    ...OperationIcon_Operation
    ...OperationLabel_OperationFragment
    ...OperationDetails_Operation
  }
`);

export interface OperationSectionProps {
  proposal: FragmentType<typeof Transaction>;
  operation: FragmentType<typeof Operation>;
  initiallyExpanded?: boolean;
}

export function OperationSection({
  proposal: proposalFragment,
  operation: operationFragment,
  initiallyExpanded = false,
}: OperationSectionProps) {
  const proposal = useFragment(Transaction, proposalFragment);
  const op = useFragment(Operation, operationFragment);

  const [expanded, toggleExpanded] = useToggle(initiallyExpanded);

  return (
    <>
      <ListItem
        leading={(props) => (
          <OperationIcon {...props} operation={op} chain={proposal.account.chain} />
        )}
        leadingSize="medium"
        headline={({ Text }) => (
          <Text>
            <OperationLabel operation={op} chain={proposal.account.chain} />
          </Text>
        )}
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
