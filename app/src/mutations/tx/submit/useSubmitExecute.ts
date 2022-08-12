import { useDeployAccount } from '@features/account/useDeployAccount';
import { useFeeToken } from '@features/tx/useFeeToken';
import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';
import { useAccount } from '~/queries/account/useAccount';

export const useSubmitExecute = (tx: ProposedTx) => {
  const account = useAccount(tx.account).account!;
  const submitExecution = useApiSubmitExecution();
  const deploy = useDeployAccount();
  const feeToken = useFeeToken();

  const execute = useCallback(
    async (wallet: CombinedWallet) => {
      // Deploy if not already deployed
      await deploy?.();

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
    },
    [deploy, tx, account.contract, feeToken.addr, submitExecution],
  );

  return execute;
};
