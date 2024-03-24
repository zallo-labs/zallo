import { Actions } from '#/layout/Actions';
import { ShareIcon } from '@theme/icons';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { share } from '~/lib/share';
import { createStyles, useStyles } from '@theme/styles';
import { CHAINS } from 'chains';
import { useConfirm } from '~/hooks/useConfirm';
import { Button } from '../Button';
import { useSideSheet } from '#/SideSheet/SideSheetLayout';

const Transaction = gql(/* GraphQL */ `
  fragment TransactionActions_Transaction on Transaction
  @argumentDefinitions(transaction: { type: "ID!" }) {
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
    ...UseApprove_Proposal
    ...UseReject_Proposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment TransactionActions_User on User {
    ...UseApprove_User
    ...UseReject_User
  }
`);

const Execute = gql(/* GraphQL */ `
  mutation TransactionActions_Execute($input: ExecuteTransactionInput!) {
    execute(input: $input) {
      id
    }
  }
`);

export interface ProposalActionsProps {
  proposal: FragmentType<typeof Transaction>;
  user: FragmentType<typeof User>;
}

export const TransactionActions = (props: ProposalActionsProps) => {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.proposal);
  const user = useFragment(User, props.user);
  const approve = useApprove({ proposal: p, user });
  const reject = useReject({ proposal: p, user });
  const execute = useMutation(Execute)[1];
  const sheet = useSideSheet();
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

      {!sheet.visible && (
        <Button mode="contained-tonal" icon="menu-open" onPress={() => sheet.show(true)}>
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
