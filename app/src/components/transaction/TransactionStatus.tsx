import { FragmentType, gql, useFragment } from '@api';
import { createStyles, useStyles } from '@theme/styles';
import { TextProps } from '@theme/types';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { match } from 'ts-pattern';

const Transaction = gql(/* GraphQL */ `
  fragment TransactionStatus_Transaction on Transaction {
    id
    status
  }
`);

export interface TransactionStatusProps extends Omit<TextProps, 'children'> {
  proposal: FragmentType<typeof Transaction>;
}

export function TransactionStatus(props: TransactionStatusProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.proposal);

  return (
    <View style={styles.container}>
      {match(p.status)
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
        .with('Executing', () => (
          <>
            <ActivityIndicator size="small" color={styles.executing.color} />
            <Text {...props} style={[props.style, styles.executing]}>
              Executing
            </Text>
          </>
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
