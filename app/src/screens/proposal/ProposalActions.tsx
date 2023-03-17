import { makeStyles } from '@theme/makeStyles';
import { Hex, MaybePromise } from 'lib';
import { Button } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { useUser } from '@api/user';
import { Proposal, useApprove, useReject } from '@api/proposal';

export type OnExecute = (response: { transactionHash: Hex }) => MaybePromise<void>;

export interface ProposalActionsProps {
  proposal: Proposal;
  onExecute?: OnExecute;
}

export const ProposalActions = ({ proposal: p, onExecute }: ProposalActionsProps) => {
  const styles = useStyles();
  const user = useUser();
  const approve = useApprove();
  const reject = useReject();

  return (
    <Actions horizontal>
      {!p.rejections.has(user.id) && (
        <Button mode="text" labelStyle={styles.rejectButtonLabel} onPress={() => reject(p)}>
          Reject
        </Button>
      )}

      {!p.approvals.has(user.id) && (
        <Button
          mode="contained"
          onPress={async () => {
            const { transactionHash } = await approve(p);
            if (transactionHash) onExecute?.({ transactionHash });
          }}
        >
          Approve
        </Button>
      )}
    </Actions>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  rejectButtonLabel: {
    color: colors.secondary,
  },
}));
