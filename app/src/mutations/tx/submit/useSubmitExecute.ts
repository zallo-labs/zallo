import { useDeployAccount } from '@features/account/useDeployAccount';
import { useFeeToken } from '@features/tx/useFeeToken';
import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';
import { CombinedWallet } from '~/queries/wallets';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';

export const useSubmitExecute = () => {
  const { account } = useSelectedWallet();
  const submitExecution = useApiSubmitExecution();
  const deploy = useDeployAccount();
  const feeToken = useFeeToken();

  const execute = useCallback(
    async (tx: ProposedTx, acc: CombinedWallet) => {
      // Deploy if not already deployed
      await deploy?.();

      const signers: Signerish[] = tx.approvals.map((approval) => ({
        approver: approval.addr,
        signature: approval.signature,
      }));

      const resp = await executeTx(account.contract, tx, acc, signers, {
        customData: {
          feeToken: feeToken.addr,
        },
      });
      await submitExecution(tx, resp);
    },
    [deploy, feeToken.addr, account.contract, submitExecution],
  );

  return execute;
};
