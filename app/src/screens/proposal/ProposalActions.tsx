import { Button } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { CHAIN } from '@network/provider';
import { RetryIcon, ShareIcon } from '@theme/icons';
import { Share } from 'react-native';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { makeStyles } from '@theme/makeStyles';
import { useApproverAddress } from '@network/useApprover';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';

const BLOCK_EXPLORER_URL = CHAIN.blockExplorers?.default.url;

const Proposal = gql(/* GraphQL */ `
  fragment ProposalActions_TransactionProposal on TransactionProposal {
    __typename
    id
    hash
    status
    updatable
    transaction {
      id
      hash
    }
    ...UseApprove_Proposal
    ...UseReject_Proposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment ProposalActions_User on User {
    ...UseApprove_User
    ...UseReject_User
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
  const approve = useApprove({ proposal: p, user, approver });
  const reject = useReject({ proposal: p, user, approver });
  const execute = useMutation(Execute)[1];

  return (
    <Actions style={styles.container}>
      {reject && <Button onPress={reject}>Reject</Button>}

      {approve && (
        <Button mode="contained" onPress={approve}>
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
  container: {
    flexGrow: 0,
  },
  retryContainer: {
    backgroundColor: colors.errorContainer,
  },
  retryLabel: {
    color: colors.onErrorContainer,
  },
}));
