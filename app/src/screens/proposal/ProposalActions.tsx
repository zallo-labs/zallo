import { PROVIDER } from '@network/provider';
import { useDevice } from '@network/useDevice';
import { MaybePromise } from 'lib';
import { Button } from 'react-native-paper';
import { TransactionResponse } from 'zksync-web3/build/src/types';
import { Actions } from '~/components/layout/Actions';
import { useApprove } from '~/mutations/proposal/approve/useApprove.api';
import { useReject } from '~/mutations/proposal/approve/useReject.api';
import { useRequestApproval } from '~/mutations/proposal/useRequestApproval.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Proposal } from '~/queries/proposal';
import { useProposalApprovers } from './useProposalApprovers';

export type OnExecute = (response: TransactionResponse) => MaybePromise<void>;

export interface ProposalActionsProps {
  proposal: Proposal;
  onExecute?: OnExecute;
}

export const ProposalActions = ({ proposal: p, onExecute }: ProposalActionsProps) => {
  const { goBack } = useRootNavigation();
  const device = useDevice();
  const approve = useApprove();
  const reject = useReject();
  const requestApproval = useRequestApproval();
  const approvers = useProposalApprovers(p);

  const isApprover =
    p.proposer.addr === device.address || p.config.approvers.some((a) => a === device.address);

  if (p.status === 'proposed' && isApprover)
    return (
      <Actions
        primary={
          p.userHasApproved ? (
            <Button mode="contained" onPress={() => requestApproval(p, approvers.notApproved)}>
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
