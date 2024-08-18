import { Button } from '#/Button';
import { Confirm } from '#/Confirm';
import { Actions } from '#/layout/Actions';
import { useApproverAddress } from '@network/useApprover';
import { createStyles, useStyles } from '@theme/styles';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { TransactionActions_executeMutation } from '~/api/__generated__/TransactionActions_executeMutation.graphql';
import { TransactionActions_transaction$key } from '~/api/__generated__/TransactionActions_transaction.graphql';
import { TransactionActions_user$key } from '~/api/__generated__/TransactionActions_user.graphql';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';

const Transaction = graphql`
  fragment TransactionActions_transaction on Transaction {
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
  fragment TransactionActions_user on User {
    ...useApprove_user
    ...useReject_user
  }
`;

const Execute = graphql`
  mutation TransactionActions_executeMutation($input: ExecuteTransactionInput!) {
    execute(input: $input) {
      id
    }
  }
`;

export interface TransactionActionsProps {
  transaction: TransactionActions_transaction$key;
  user: TransactionActions_user$key;
}

export function TransactionActions(props: TransactionActionsProps) {
  const { styles } = useStyles(stylesheet);
  const t = useFragment(Transaction, props.transaction);
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const approve = useApprove({ proposal: t, user, approver });
  const reject = useReject({ proposal: t, user, approver });

  const execute = useMutation<TransactionActions_executeMutation>(Execute);
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
            (await Confirm.call({
              title: 'Force execute?',
              message:
                'This transaction is expected to fail.\nAre you sure you want to execute it anyway?',
              type: 'warning',
              confirmLabel: 'Execute anyway',
            })) && execute({ input: { id: t.id, ignoreSimulation: true } })
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
