import { PROVIDER } from '@network/provider';
import { MaybePromise } from 'lib';
import { Button } from 'react-native-paper';
import { TransactionResponse } from 'zksync-web3/build/src/types';
import { Actions } from '~/components/layout/Actions';
import { useApprove } from '~/mutations/proposal/approve/useApprove.api';
import { useReject } from '~/mutations/proposal/approve/useReject.api';
import { useRequestApproval } from '~/mutations/proposal/useRequestApproval.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Proposal } from '~/queries/proposal';
import { useQuorum } from '~/queries/quroum/useQuorum.api';
import { useUser } from '~/queries/useUser.api';

export type OnExecute = (response: TransactionResponse) => MaybePromise<void>;

export interface ProposalActionsProps {
  proposal: Proposal;
  onExecute?: OnExecute;
}

export const ProposalActions = ({ proposal: p, onExecute }: ProposalActionsProps) => {
  const { goBack } = useRootNavigation();
  const user = useUser();
  const approve = useApprove();
  const reject = useReject();
  const requestApproval = useRequestApproval();
  const quorum = useQuorum(p.quorum);

  const userHasApproved = p.approvals.has(user.id);
  const isApprover = quorum.activeOrLatest?.approvers.has(user.id);
  const awaitingApprovalFrom = new Set(
    [...(quorum.activeOrLatest?.approvers.values() ?? [])].filter(
      (a) => !p.approvals.has(a) && !p.rejected.has(a),
    ),
  );

  if (p.state === 'pending' && isApprover)
    return (
      <Actions
        primary={
          userHasApproved ? (
            <Button mode="contained" onPress={() => requestApproval(p, awaitingApprovalFrom)}>
              Request approval
            </Button>
          ) : (
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
          <Button
            onPress={async () => {
              const { removed } = await reject(p);
              if (removed) goBack();
            }}
          >
            Reject
          </Button>
        }
      />
    );

  return null;
};
