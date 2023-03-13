import { PROVIDER } from '@network/provider';
import { makeStyles } from '@theme/makeStyles';
import { MaybePromise } from 'lib';
import { Button } from 'react-native-paper';
import { TransactionResponse } from 'zksync-web3/build/src/types';
import { Actions } from '~/components/layout/Actions';
import { useUser } from '@api/user';
import { Proposal, useApprove, useReject } from '@api/proposal';

export type OnExecute = (response: TransactionResponse) => MaybePromise<void>;

export interface ProposalActionsProps {
  proposal: Proposal;
  onExecute?: OnExecute;
}

export const ProposalActions = ({ proposal: p, onExecute }: ProposalActionsProps) => {
  const styles = useStyles();
  const user = useUser();
  const approve = useApprove();
  const reject = useReject();

  const isApprover = quorum.activeOrLatest.approvers.has(user.id);

  if (p.state === 'pending' && isApprover)
    return (
      <Actions
        primary={
          !p.approvals.has(user.id) && (
            <Button
              mode="contained"
              onPress={async () => {
                const { submissionHash } = await approve(p);
                if (submissionHash && onExecute)
                  onExecute(await PROVIDER.getTransaction(submissionHash));
              }}
            >
              Approve
            </Button>
          )
        }
        secondary={
          !p.rejected.has(user.id) && (
            <Button mode="text" labelStyle={styles.rejectButtonLabel} onPress={() => reject(p)}>
              Reject
            </Button>
          )
        }
      />
    );

  return null;
};

const useStyles = makeStyles(({ colors }) => ({
  rejectButtonLabel: {
    color: colors.secondary,
  },
}));
