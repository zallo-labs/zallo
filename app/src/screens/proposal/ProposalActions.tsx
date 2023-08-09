import { Button } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { CHAIN } from '@network/provider';
import { BluetoothIcon, RetryIcon, ShareIcon } from '@theme/icons';
import { Share } from 'react-native';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useCanRespond } from '~/components/proposal/useCanRespond';
import { useMutation } from 'urql';
import { makeStyles } from '@theme/makeStyles';
import { useApproverAddress } from '@network/useApprover';
import { useSignWithApprover } from './useSignWithApprover';
import { useSignWithLedger } from '../ledger-sign/LedgerSignSheet';
import { proposalAsEip712Message } from '../ledger-sign/proposalAsEip712Message';

const BLOCK_EXPLORER_URL = CHAIN.blockExplorers?.default.url;

const Proposal = gql(/* GraphQL */ `
  fragment ProposalActions_TransactionProposalFragment on TransactionProposal {
    id
    hash
    status
    transaction {
      id
      hash
    }
    ...UseCanRespond_TransactionProposalFragment
    ...UseSignWithApprover_TransactionPropsosal
    ...ProposalAsEip712Message_TransactionProposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment ProposalActions_User on User {
    id
    approvers {
      id
      address
      name
    }
    ...UseCanRespond_User
  }
`);

const Approve = gql(/* GraphQL */ `
  mutation ApproveProposal($input: ApproveInput!) {
    approve(input: $input) {
      id
      approvals {
        id
      }
      rejections {
        id
      }
    }
  }
`);

const Reject = gql(/* GraphQL */ `
  mutation RejectProposal($proposal: Bytes32!) {
    reject(input: { hash: $proposal }) {
      id
      approvals {
        id
      }
      rejections {
        id
      }
    }
  }
`);

const Execute = gql(/* GraphQL */ `
  mutation ProposalActions_Execute($proposal: Bytes32!) {
    execute(input: { proposalHash: $proposal }) {
      id
    }
  }
`);

export interface ProposalActionsProps {
  proposal: FragmentType<typeof Proposal>;
  user: FragmentType<typeof User>;
}

export const ProposalActions = (props: ProposalActionsProps) => {
  const styles = useStyles();
  const p = useFragment(Proposal, props.proposal);
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const signWithApprover = useSignWithApprover();
  const signWithLedger = useSignWithLedger();

  const { canApprove, canReject } = useCanRespond({ proposal: p, user });
  const approve = useMutation(Approve)[1];
  const reject = useMutation(Reject)[1];
  const execute = useMutation(Execute)[1];

  return (
    <Actions style={{ flexGrow: 0 }}>
      {canReject.includes(approver) && (
        <Button onPress={() => reject({ proposal: p.hash })}>Reject</Button>
      )}

      {canApprove
        .filter((a) => a !== approver)
        .map((approver) => (
          <Button
            key={approver}
            mode="contained-tonal"
            icon={BluetoothIcon}
            onPress={async () => {
              const { signature } = await signWithLedger({
                device: approver,
                content: await proposalAsEip712Message(p),
              });
              await approve({ input: { hash: p.hash, approver, signature } });
            }}
          >
            Approve with {user.approvers.find((a) => a.address === approver)?.name}
          </Button>
        ))}

      {canApprove.includes(approver) && (
        <Button
          mode="contained"
          onPress={async () => {
            const signature = await signWithApprover(p);
            if (signature.isOk())
              await approve({ input: { hash: p.hash, signature: signature.value } });
          }}
        >
          Approve
        </Button>
      )}

      {p.transaction && BLOCK_EXPLORER_URL && (
        <Button
          mode="contained-tonal"
          icon={ShareIcon}
          onPress={() => {
            const url = `${BLOCK_EXPLORER_URL}/tx/${p.transaction!.hash}`;
            Share.share({ message: url, url });
          }}
        >
          Share receipt
        </Button>
      )}

      {p.status === 'Failed' && (
        <Button
          mode="contained"
          icon={RetryIcon}
          onPress={() => execute({ proposal: p.hash })}
          contentStyle={styles.retryContainer}
          labelStyle={styles.retryLabel}
        >
          Retry
        </Button>
      )}
    </Actions>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  retryContainer: {
    backgroundColor: colors.errorContainer,
  },
  retryLabel: {
    color: colors.onErrorContainer,
  },
}));
