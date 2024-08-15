import { ListItem, ListItemProps } from '#/list/ListItem';
import { OperationIcon } from '#/transaction/OperationIcon';
import { OperationLabel } from '#/transaction/OperationLabel';
import { Chain } from 'chains';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { OperationSummaryItem_operation$key } from '~/api/__generated__/OperationSummaryItem_operation.graphql';

const Operation = graphql`
  fragment OperationSummaryItem_operation on Operation {
    to
    value
    data
    ...OperationIcon_operation
    ...OperationLabel_operation
  }
`;

export interface OperationSummaryItemProps extends Partial<ListItemProps> {
  operation: OperationSummaryItem_operation$key;
  chain: Chain;
}

export function OperationSummaryItem(props: OperationSummaryItemProps) {
  const op = useFragment(Operation, props.operation);

  return (
    <ListItem
      leading={<OperationIcon operation={op} chain={props.chain} />}
      leadingSize="medium"
      headline={<OperationLabel operation={op} chain={props.chain} />}
      {...props}
    />
  );
}
