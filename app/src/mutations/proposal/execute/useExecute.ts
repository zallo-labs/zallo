import assert from 'assert';
import { executeTx, Signer } from 'lib';
import { useCallback } from 'react';
import { useAccount } from '~/queries/account/useAccount.api';
import { Proposal } from '~/queries/proposal';
import { CombinedUser, toActiveUser } from '~/queries/user/useUser.api';
import { useApiSubmitExecution } from './useSubmitExecution.api';

export const useExecute = (user: CombinedUser, p: Proposal) => {
  const [account] = useAccount(user.account);
  const submitExecution = useApiSubmitExecution();

  return useCallback(async () => {
    const signers: Signer[] = p.approvals.map((approval) => ({
      approver: approval.addr,
      signature: approval.signature,
    }));

    assert(user.configs.active);
    const resp = await executeTx(
      account.contract,
      p,
      toActiveUser(user),
      signers,
    );

    await submitExecution(p, resp);
  }, [p, user, account.contract, submitExecution]);
};
