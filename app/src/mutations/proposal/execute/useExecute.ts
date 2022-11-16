import { executeTx, Signer, UserId } from 'lib';
import { useCallback } from 'react';
import { useAccount } from '~/queries/account/useAccount.api';
import { Proposal } from '~/queries/proposal';
import { toActiveUser, useUser } from '~/queries/user/useUser.api';
import { useApiSubmitExecution } from './useSubmitExecution.api';

export const useExecute = (proposerId: UserId, proposal: Proposal) => {
  const [proposer] = useUser(proposerId);
  const [account] = useAccount(proposer.account);
  const submitExecution = useApiSubmitExecution();

  return useCallback(async () => {
    const signers: Signer[] = proposal.approvals.map((approval) => ({
      approver: approval.addr,
      signature: approval.signature,
    }));

    const resp = await executeTx(account.contract, proposal, toActiveUser(proposer), signers);

    await submitExecution(proposal, resp);

    return resp;
  }, [proposal, proposer, account.contract, submitExecution]);
};
