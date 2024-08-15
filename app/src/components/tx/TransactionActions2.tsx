import { Button } from '#/Button';
import { Actions } from '#/layout/Actions';
import { useApproverAddress } from '@network/useApprover';
import { createStyles, useStyles } from '@theme/styles';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { TransactionActions2_executeMutation } from '~/api/__generated__/TransactionActions2_executeMutation.graphql';
import { TransactionActions2_transaction$key } from '~/api/__generated__/TransactionActions2_transaction.graphql';
import { TransactionActions2_user$key } from '~/api/__generated__/TransactionActions2_user.graphql';
import { useApprove } from '~/hooks/useApprove';
import { useConfirm } from '~/hooks/useConfirm';
import { useReject } from '~/hooks/useReject';

const Transaction = graphql`
  fragment TransactionActions2_transaction on Transaction {
    id
    approvals {
      approver {
        address
      }
    }
    rejections {
      approver {
        address
      }
    }
    status
    result {
      __typename
      ... on SimulatedFailure {
        reason
      }
    }
    ...useApprove_proposal
    ...useReject_proposal
  }
`;

const User = graphql`
  fragment TransactionActions2_user on User {
    ...useApprove_user
    ...useReject_user
  }
`;

const Execute = graphql`
  mutation TransactionActions2_executeMutation($input: ExecuteTransactionInput!) {
    execute(input: $input) {
      id
    }
  }
`;

export interface TransactionActions2Props {
  transaction: TransactionActions2_transaction$key;
  user: TransactionActions2_user$key;
}

export function TransactionActions2(props: TransactionActions2Props) {
  const { styles } = useStyles(stylesheet);
  const t = useFragment(Transaction, props.transaction);
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const approve = useApprove({ proposal: t, user, approver });
  const reject = useReject({ proposal: t, user, approver });

  const execute = useMutation<TransactionActions2_executeMutation>(Execute);
  const confirmExecute = useConfirm({
    title: 'Force execute?',
    message: 'This transaction is expected to fail.\nAre you sure you want to execute it anyway?',
    type: 'warning',
    confirmLabel: 'Execute anyway',
  });
  const showForceExecute =
    t.status === 'Pending' && t.result?.__typename === 'SimulatedFailure' && !!t.result.reason; // Don't allow force executing if only validation errors exist

  return (
    <Actions horizontal>
      {showForceExecute && (
        <Button
          mode="contained"
          contentStyle={styles.executeContainer}
          labelStyle={styles.executeLabel}
          onPress={async () =>
            (await confirmExecute()) && execute({ input: { id: t.id, ignoreSimulation: true } })
          }
        >
          Force execute
        </Button>
      )}

      {approve && (
        <Button mode="contained" onPress={approve}>
          Approve
        </Button>
      )}

      {reject && (
        <Button mode="text" onPress={reject}>
          Reject
        </Button>
      )}
    </Actions>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  executeContainer: {
    backgroundColor: colors.error,
  },
  executeLabel: {
    color: colors.onError,
  },
}));
