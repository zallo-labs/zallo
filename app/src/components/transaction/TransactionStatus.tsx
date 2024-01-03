import { FragmentType, gql, useFragment } from '@api';
import { CancelIcon, DoubleCheckIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { match } from 'ts-pattern';

const ApprovalIcon = materialCommunityIcon('security');

const TransactionProposal = gql(/* GraphQL */ `
  fragment TransactionStatus_TransactionProposal on TransactionProposal {
    id
    status
  }
`);

export interface TransactionStatusProps {
  proposal: FragmentType<typeof TransactionProposal>;
}

export function TransactionStatus(props: TransactionStatusProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(TransactionProposal, props.proposal);

  return (
    <View style={styles.container}>
      {match(p.status)
        .with('Pending', () => (
          <>
            <ApprovalIcon style={styles.text} size={styles.icon.width} />
            <Text variant="headlineSmall" style={styles.text}>
              Awaiting approval
            </Text>
          </>
        ))
        .with('Executing', () => (
          <>
            <ActivityIndicator size="small" color={styles.text.color} />
            <Text variant="headlineSmall" style={styles.text}>
              Executing
            </Text>
          </>
        ))
        .with('Successful', () => (
          <>
            <DoubleCheckIcon style={styles.text} size={styles.icon.width} />
            <Text variant="headlineSmall" style={styles.text}>
              Executed
            </Text>
          </>
        ))
        .with('Failed', () => (
          <>
            <CancelIcon style={styles.failed} size={styles.icon.width} />
            <Text variant="headlineSmall" style={styles.failed}>
              Failed
            </Text>
          </>
        ))
        .otherwise(() => null)}
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  icon: {
    width: 24,
  },
  text: {
    color: colors.tertiary,
  },
  failed: {
    color: colors.error,
  },
}));
