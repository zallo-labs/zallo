import { Button } from '#/Button';
import { Timestamp } from '#/format/Timestamp';
import { Actions } from '#/layout/Actions';
import { SIDE_SHEET } from '#/SideSheet/SideSheetLayout';
import { CheckAllIcon, CloseIcon, WebIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { CHAINS } from 'chains';
import { Link, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { match, P } from 'ts-pattern';
import { useMutation } from '~/api';
import { TransactionStatus_cancelMutation } from '~/api/__generated__/TransactionStatus_cancelMutation.graphql';
import { TransactionStatus_transaction$key } from '~/api/__generated__/TransactionStatus_transaction.graphql';

const CancelScheduled = graphql`
  mutation TransactionStatus_cancelMutation($input: ProposeCancelScheduledTransactionInput!) {
    proposeCancelScheduledTransaction(input: $input) {
      id
    }
  }
`;

const Transaction = graphql`
  fragment TransactionStatus_transaction on Transaction {
    id
    status
    account {
      id
      chain
      address
    }
    result {
      __typename
      id
      timestamp
      systx {
        id
        hash
      }
    }
    approvals {
      id
    }
    policy {
      id
      name
      threshold
    }
  }
`;

export interface TransactionStatusProps {
  transaction: TransactionStatus_transaction$key;
}

export function TransactionStatus(props: TransactionStatusProps) {
  const { styles } = useStyles(stylesheet);
  const t = useFragment(Transaction, props.transaction);
  const router = useRouter();
  const cancelScheduled = useMutation<TransactionStatus_cancelMutation>(CancelScheduled);
  const showSheet = useSetAtom(SIDE_SHEET);

  const approvalsButton = (
    <Button mode="contained-tonal" icon={CheckAllIcon} onPress={() => showSheet((s) => !s)}>
      Approvals
    </Button>
  );

  const chain = CHAINS[t.account.chain];
  const blockExplorer = chain.blockExplorers?.native || chain.blockExplorers?.default;
  const explorerButton = blockExplorer && t.result?.systx && (
    <Link href={blockExplorer.url + `tx/${t.result.systx.hash}`} asChild>
      <Button mode="contained-tonal" icon={WebIcon}>
        Explorer
      </Button>
    </Link>
  );

  return match(t)
    .with(P.union({ result: P.nullish }, { status: 'Pending' }), () => (
      <View style={styles.container}>
        {t.approvals.length < t.policy.threshold ? (
          <Text variant="headlineMedium">
            Pending approval
            <Text style={styles.tertiary}>
              {' '}
              ({t.approvals.length}/{t.policy.threshold})
            </Text>
          </Text>
        ) : (
          <Text variant="headlineMedium">Pending execution</Text>
        )}

        <Text variant="bodyLarge">Policy: {t.policy.name}</Text>

        {!t.result && (
          <View style={styles.simulatingContainer}>
            <ActivityIndicator size={18} color={styles.tertiary.color} />
            <Text variant="titleMedium" style={styles.tertiary}>
              Simulating
            </Text>
          </View>
        )}

        <View style={styles.actions}>{approvalsButton}</View>
      </View>
    ))
    .with({ status: 'Successful' }, (t) => (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.success}>
          Successful
        </Text>

        {t.result?.__typename === 'ConfirmedSuccess' ? (
          <Text variant="bodyLarge">
            <Timestamp timestamp={t.result.timestamp} />
          </Text>
        ) : (
          <View style={styles.simulatingContainer}>
            <ActivityIndicator size={ICON_SIZE.extraSmall} color={styles.tertiary.color} />
            <Text variant="titleMedium" style={styles.tertiary}>
              Confirming
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <>
            {approvalsButton}
            {explorerButton}
          </>
        </View>
      </View>
    ))
    .with({ status: 'Failed' }, (t) => (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.failure}>
          Failed
        </Text>

        {t.result?.__typename === 'ConfirmedFailure' ? (
          <Text variant="bodyLarge">
            <Timestamp timestamp={t.result.timestamp} />
          </Text>
        ) : (
          <View style={styles.simulatingContainer}>
            <ActivityIndicator size={ICON_SIZE.extraSmall} color={styles.tertiary.color} />
            <Text variant="titleMedium" style={styles.tertiary}>
              Confirming
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <>
            {approvalsButton}
            {explorerButton}
          </>
        </View>
      </View>
    ))
    .with({ status: 'Scheduled' }, () => (
      <View style={styles.container}>
        <Text variant="headlineMedium">Scheduled</Text>

        <Text variant="bodyLarge">
          <Timestamp timestamp={t.result!.timestamp} />
        </Text>

        <View style={styles.actions}>
          <>
            {approvalsButton}
            {explorerButton}
            <Button
              mode="contained"
              icon={CloseIcon}
              onPress={async () => {
                const id = (
                  await cancelScheduled({
                    input: { account: t.account.address, proposal: t.id },
                  })
                ).proposeCancelScheduledTransaction.id;

                router.push({
                  pathname: '/(nav)/[account]/(home)/activity/transaction/[id]',
                  params: { account: t.account.address, id },
                });
              }}
            >
              Cancel
            </Button>
          </>
        </View>
      </View>
    ))
    .with({ status: 'Cancelled' }, () => (
      <View style={styles.container}>
        <Text variant="headlineMedium">Cancelled</Text>

        <View style={styles.actions}>
          <>
            {approvalsButton}
            {explorerButton}
          </>
        </View>
      </View>
    ))
    .otherwise(() => null);
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  tertiary: {
    color: colors.tertiary,
  },
  simulatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  success: {
    color: colors.success,
  },
  failure: {
    color: colors.error,
  },
}));
