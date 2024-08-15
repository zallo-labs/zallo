import { createStyles, useStyles } from '@theme/styles';
import { TextProps } from '@theme/types';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { match } from 'ts-pattern';
import { TransactionStatus_transaction$key } from '~/api/__generated__/TransactionStatus_transaction.graphql';

const Transaction = graphql`
  fragment TransactionStatus_transaction on Transaction {
    id
    status
  }
`;

export interface TransactionStatusProps extends Omit<TextProps, 'children'> {
  transaction: TransactionStatus_transaction$key;
}

export function TransactionStatus(props: TransactionStatusProps) {
  const { styles } = useStyles(stylesheet);
  const t = useFragment(Transaction, props.transaction);

  return (
    <View style={styles.container}>
      {match(t.status)
        .with('Pending', () => (
          <Text {...props} style={[props.style, styles.pending]}>
            Pending approval
          </Text>
        ))
        .with('Scheduled', () => (
          <Text {...props} style={[props.style, styles.scheduled]}>
            Scheduled
          </Text>
        ))
        .with('Successful', () => (
          <Text {...props} style={[props.style, styles.successful]}>
            Executed
          </Text>
        ))
        .with('Failed', () => (
          <Text {...props} style={[props.style, styles.failed]}>
            Failed
          </Text>
        ))
        .with('Cancelled', () => (
          <Text {...props} style={[props.style, styles.cancelled]}>
            Cancelled
          </Text>
        ))
        .exhaustive()}
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pending: {
    color: colors.primary,
  },
  scheduled: {
    color: colors.tertiary,
  },
  executing: {
    color: colors.tertiary,
  },
  successful: {
    color: colors.success,
  },
  failed: {
    color: colors.error,
  },
  cancelled: {
    color: colors.warning,
  },
}));
