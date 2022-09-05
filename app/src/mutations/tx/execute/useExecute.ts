import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { CombinedWallet, toActiveWallet } from '~/queries/wallets';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';
import { CombinedAccount } from '~/queries/account';

export const useExecute = (
  account: CombinedAccount,
  wallet: CombinedWallet,
  tx: ProposedTx,
) => {
  const submitExecution = useApiSubmitExecution();

  return useCallback(async () => {
    const signers: Signerish[] = tx.approvals.map((approval) => ({
      approver: approval.addr,
      signature: approval.signature,
    }));

    const resp = await executeTx(
      account.contract,
      tx,
      toActiveWallet(wallet),
      signers,
    );

    await submitExecution(tx, resp);
  }, [wallet, tx, account.contract, submitExecution]);
};
