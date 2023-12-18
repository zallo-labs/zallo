import { Button } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { RetryIcon, ShareIcon } from '@theme/icons';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { useApproverAddress } from '~/lib/network/useApprover';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { share } from '~/lib/share';
import { createStyles, useStyles } from '@theme/styles';
import { CHAINS } from 'chains';

const Proposal = gql(/* GraphQL */ `
  fragment ProposalActions_TransactionProposal on TransactionProposal {
    __typename
    id
    status
    updatable
    account {
      id
      chain
    }
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
  mutation ProposalActions_Execute($proposal: UUID!) {
    execute(input: { id: $proposal }) {
      id
    }
  }
`);

export interface ProposalActionsProps {
  proposal: FragmentType<typeof Proposal>;
  user: FragmentType<typeof User>;
}

export const ProposalActions = (props: ProposalActionsProps) => {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Proposal, props.proposal);
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const approve = useApprove({ proposal: p, user, approver });
  const reject = useReject({ proposal: p, user, approver });
  const execute = useMutation(Execute)[1];

  const blockExplorer = CHAINS[p.account.chain].blockExplorers?.default;

  return (
    <Actions flex={false}>
      {reject && <Button onPress={reject}>Reject</Button>}

      {approve && (
        <Button mode="contained" onPress={approve}>
          Approve
        </Button>
      )}

      {p.transaction && blockExplorer && (
        <Button
          mode="contained-tonal"
          icon={ShareIcon}
          onPress={() => share({ url: `${blockExplorer.url}/tx/${p.transaction!.hash}` })}
        >
          Share receipt
        </Button>
      )}

      {p.status === 'Failed' && (
        <Button
          mode="contained"
          icon={RetryIcon}
          onPress={() => execute({ proposal: p.id })}
          contentStyle={styles.retryContainer}
          labelStyle={styles.retryLabel}
        >
          Retry
        </Button>
      )}
    </Actions>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  retryContainer: {
    backgroundColor: colors.errorContainer,
  },
  retryLabel: {
    color: colors.onErrorContainer,
  },
}));
