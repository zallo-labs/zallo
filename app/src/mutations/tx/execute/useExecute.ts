import { useDeployAccount } from '@features/account/useDeployAccount';
import { useFeeToken } from '@features/tx/useFeeToken';
import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';
import { CombinedAccount } from '~/queries/account';

export const useExecute = (
  account: CombinedAccount,
  wallet: CombinedWallet,
  tx: ProposedTx,
) => {
  const submitExecution = useApiSubmitExecution();
  const deploy = useDeployAccount(account);
  const feeToken = useFeeToken();

  const execute = useCallback(async () => {
    // Deploy if not already deployed
    await deploy?.(wallet);

    const signers: Signerish[] = tx.approvals.map((approval) => ({
      approver: approval.addr,
      signature: approval.signature,
    }));

    const resp = await executeTx(
      account.contract,
      tx,
      toWallet(wallet),
      signers,
      {
        customData: {
          feeToken: feeToken.addr,
        },
      },
    );
    await submitExecution(tx, resp);
  }, [account, deploy, tx, wallet, feeToken.addr, submitExecution]);

  return execute;
};
