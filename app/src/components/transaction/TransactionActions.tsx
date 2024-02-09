import { Actions } from '#/layout/Actions';
import { ShareIcon } from '@theme/icons';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { useApproverAddress } from '~/lib/network/useApprover';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { share } from '~/lib/share';
import { createStyles, useStyles } from '@theme/styles';
import { CHAINS } from 'chains';
import { useConfirm } from '~/hooks/useConfirm';
import { Button } from '../Button';

const Transaction = gql(/* GraphQL */ `
  fragment TransactionActions_TransactionProposal on TransactionProposal
  @argumentDefinitions(proposal: { type: "UUID!" }) {
    id
    status
    updatable
    transaction {
      id
      hash
    }
    account {
      id
      chain
      policies {
        id
        satisfiability(input: { proposal: $proposal }) {
          result
        }
      }
    }
    policy {
      id
    }
    simulation {
      id
      success
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
  mutation TransactionActions_Execute($input: ExecuteTransactionProposalInput!) {
    execute(input: $input) {
      id
    }
  }
`);

export interface ProposalActionsProps {
  proposal: FragmentType<typeof Transaction>;
  user: FragmentType<typeof User>;
  approvalsSheet: {
    visible: boolean;
    open: () => void;
  };
}

export const TransactionActions = (props: ProposalActionsProps) => {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.proposal);
  const user = useFragment(User, props.user);
  const approve = useApprove({ proposal: p, user });
  const reject = useReject({ proposal: p, user });
  const execute = useMutation(Execute)[1];
  const confirmExecute = useConfirm({
    title: 'Force execute?',
    message: 'This transaction is expected to fail.\nAre you sure you want to execute it anyway?',
    type: 'warning',
    confirmLabel: 'Execute anyway',
  });

  const blockExplorer = CHAINS[p.account.chain].blockExplorers?.default;

  const showForceExecute =
    p.status === 'Pending' &&
    p.account.policies.some(
      (policy) =>
        policy.satisfiability.result === 'satisfied' && (!p.policy || policy.id === p.policy.id),
    );

  return (
    <Actions>
      {p.transaction && blockExplorer && (
        <Button
          mode="text"
          icon={ShareIcon}
          onPress={() => share({ url: `${blockExplorer.url}/tx/${p.transaction!.hash}` })}
        >
          Share receipt
        </Button>
      )}

      {reject && <Button onPress={reject}>Reject</Button>}

      {!props.approvalsSheet.open && (
        <Button mode="contained-tonal" icon="menu-open" onPress={props.approvalsSheet.open}>
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
