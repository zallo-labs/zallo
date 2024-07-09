import { Actions } from '#/layout/Actions';
import { ShareIcon } from '@theme/icons';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { share } from '~/lib/share';
import { createStyles, useStyles } from '@theme/styles';
import { CHAINS } from 'chains';
import { useConfirm } from '~/hooks/useConfirm';
import { Button } from '../Button';
import { SIDE_SHEET } from '#/SideSheet/SideSheetLayout';
import { useAtom } from 'jotai';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { TransactionActions_transaction$key } from '~/api/__generated__/TransactionActions_transaction.graphql';
import { TransactionActions_user$key } from '~/api/__generated__/TransactionActions_user.graphql';
import { useMutation } from '~/api';

const Transaction = graphql`
  fragment TransactionActions_transaction on Transaction {
    id
    status
    updatable
    executable
    account {
      id
      chain
    }
    validationErrors {
      reason
    }
    simulation {
      id
      success
    }
    systx {
      id
      hash
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

export const TransactionActions = (props: TransactionActionsProps) => {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.transaction);
  const user = useFragment(User, props.user);
  const approve = useApprove({ proposal: p, user });
  const reject = useReject({ proposal: p, user });
  const execute = useMutation(Execute);
  const [sheetVisible, showSheet] = useAtom(SIDE_SHEET);
  const confirmExecute = useConfirm({
    title: 'Force execute?',
    message: 'This transaction is expected to fail.\nAre you sure you want to execute it anyway?',
    type: 'warning',
    confirmLabel: 'Execute anyway',
  });

  const blockExplorer = CHAINS[p.account.chain].blockExplorers?.default;
  const showForceExecute = p.status === 'Pending' && p.executable && !p.simulation?.success;

  return (
    <Actions>
      {p.systx && blockExplorer && (
        <Button
          mode="text"
          icon={ShareIcon}
          onPress={() => share({ url: `${blockExplorer.url}/tx/${p.systx!.hash}` })}
        >
          Share receipt
        </Button>
      )}

      {reject && <Button onPress={reject}>Reject</Button>}

      {!sheetVisible && (
        <Button mode="contained-tonal" icon="menu-open" onPress={() => showSheet(true)}>
          View approvals
        </Button>
      )}

      {approve && (
        <Button mode="contained" onPress={approve}>
          Approve
        </Button>
      )}

      {showForceExecute && (
        <Button
          mode="contained"
          contentStyle={styles.retryContainer}
          labelStyle={styles.retryLabel}
          onPress={async () =>
            (await confirmExecute()) && execute({ input: { id: p.id, ignoreSimulation: true } })
          }
        >
          Execute
        </Button>
      )}
    </Actions>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  retryContainer: {
    backgroundColor: colors.warningContainer,
  },
  retryLabel: {
    color: colors.onWarningContainer,
  },
}));
