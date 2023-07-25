import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { CHAIN } from '@network/provider';
import { RetryIcon, ShareIcon } from '@theme/icons';
import { Share } from 'react-native';
import { FragmentType, gql, useFragment } from '@api/gen';
import { useCanRespond } from '~/components/proposal/useCanRespond';
import { useApprove } from './useApprove';
import { useMutation } from 'urql';

const BLOCK_EXPLORER_URL = CHAIN.blockExplorers?.default.url;

const ProposalFragment = gql(/* GraphQL */ `
  fragment ProposalActions_TransactionProposalFragment on TransactionProposal {
    id
    hash
    status
    transaction {
      id
      hash
    }
    ...UseCanRespond_TransactionProposalFragment
    ...UseApprove_TransactionProposalFragment
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
  proposal: FragmentType<typeof ProposalFragment>;
}

export const ProposalActions = (props: ProposalActionsProps) => {
  const p = useFragment(ProposalFragment, props.proposal);

  const { canApprove, canReject } = useCanRespond(p);
  const approve = useApprove();
  const reject = useMutation(Reject)[1];
  const execute = useMutation(Execute)[1];

  return (
    <Actions style={{ flexGrow: 0 }}>
      {canReject && <Button onPress={() => reject({ proposal: p.hash })}>Reject</Button>}

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
        <Button mode="contained" icon={RetryIcon} onPress={() => execute({ proposal: p.hash })}>
          Retry
        </Button>
      )}
    </Actions>
  );
};
