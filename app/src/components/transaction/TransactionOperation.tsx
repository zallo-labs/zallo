import { createStyles, useStyles } from '@theme/styles';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TransactionOperation_operation$key } from '~/api/__generated__/TransactionOperation_operation.graphql';
import { useToggle } from '~/hooks/useToggle';
import { OperationSummaryItem } from './OperationSummaryItem';
import Collapsible from 'react-native-collapsible';
import { OperationDetails } from '#/transaction/OperationDetails';
import { asChain, UAddress } from 'lib';
import { Divider } from 'react-native-paper';
import { Chevron } from '#/Chevron';
import { PressableOpacity } from '#/PressableOpacity';
import { useState } from 'react';

const Operation = graphql`
  fragment TransactionOperation_operation on Operation {
    ...OperationSummaryItem_operation
    ...OperationDetails_operation
  }
`;

export interface TransactionOperationProps {
  account: UAddress;
  operation: TransactionOperation_operation$key;
}

export function TransactionOperation({ account, ...props }: TransactionOperationProps) {
  const { styles } = useStyles(stylesheet);
  const op = useFragment(Operation, props.operation);

  const [expanded, setExpanded] = useState(false);

  return (
    <PressableOpacity style={styles.container} onPress={() => setExpanded((e) => !e)}>
      <OperationSummaryItem
        operation={op}
        chain={asChain(account)}
        trailing={<Chevron expanded={expanded} />}
        containerStyle={styles.summaryItem}
      />

      <Collapsible collapsed={!expanded}>
        <Divider leftInset style={styles.divider} />
        <OperationDetails account={account} operation={op} />
      </Collapsible>
    </PressableOpacity>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  summaryItem: {
    pointerEvents: 'none',
  },
  divider: {
    marginVertical: 8,
  }
}));
