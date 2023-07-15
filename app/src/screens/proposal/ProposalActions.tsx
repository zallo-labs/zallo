import { useApprove } from '@api/proposal';
import { useApproverAddress } from '@network/useApprover';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { CHAIN } from '@network/provider';
import { RetryIcon, ShareIcon } from '@theme/icons';
import { Share } from 'react-native';
import { useExecute } from '@api/transaction/useExecute';
import { FragmentType, gql, useFragment } from '@api/gen';
import { useRejectProposalMutation } from '@api/generated';

const BLOCK_EXPLORER_URL = CHAIN.blockExplorers?.default.url;

const ProposalFragment = gql(/* GraphQL */ `
  fragment ProposalActions_TransactionProposalFragment on TransactionProposal
  @argumentDefinitions(proposal: { type: "Bytes32!" }) {
    id
    hash
    status
    account {
      id
      policies {
        id
        key
        satisfiability(input: { proposal: $proposal }) {
          result
        }
        state {
          id
          approvers {
            id
            address
          }
        }
      }
    }
    policy {
      id
      key
    }
    approvals {
      id
      approver {
        id
        address
      }
    }
    rejections {
      id
      approver {
        id
        address
      }
    }
    transaction {
      id
      hash
    }
    ...UseApprove_TransactionProposalFragment
  }
`);

gql(/* GraphQL */ `
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

export interface ProposalActionsProps {
  proposal: FragmentType<typeof ProposalFragment>;
}

export const ProposalActions = (props: ProposalActionsProps) => {
  const p = useFragment(ProposalFragment, props.proposal);
  const approver = useApproverAddress();

  const policy =
    p.account.policies.find(({ key }) => key === p.policy?.key) ?? p.account.policies[0];

  const approve = useApprove();
  const [reject] = useRejectProposalMutation();
  const execute = useExecute();

  const [canApprove, canReject] =
    p.status === 'Pending' && policy?.state?.approvers.find((a) => a.address === approver)
      ? [
          !p.approvals.find((a) => a.approver.address === approver),
          !p.rejections.find((a) => a.approver.address === approver),
        ]
      : [false, false];

  return (
    <Actions style={{ flexGrow: 0 }}>
      {canReject && (
        <Button onPress={() => reject({ variables: { proposal: p.hash } })}>Reject</Button>
      )}

      {canApprove && (
        <Button mode="contained" onPress={() => approve(p)}>
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
        <Button mode="contained" icon={RetryIcon} onPress={() => execute({ proposalHash: p.hash })}>
          Retry
        </Button>
      )}
    </Actions>
  );
};
