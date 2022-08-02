import { useDeploySafe } from '@features/safe/useDeploySafe';
import { useFeeToken } from '@features/tx/useFeeToken';
import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
import { CombinedAccount } from '~/queries/accounts';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';

export const useSubmitExecute = () => {
  const { safe } = useSelectedAccount();
  const submitExecution = useApiSubmitExecution();
  const deploy = useDeploySafe();
  const feeToken = useFeeToken();

  const execute = useCallback(
    async (tx: ProposedTx, acc: CombinedAccount) => {
      // Deploy if not already deployed
      await deploy?.();

      const signers: Signerish[] = tx.approvals.map((approval) => ({
        approver: approval.addr,
        signature: approval.signature,
      }));

      const resp = await executeTx(safe.contract, tx, acc, signers, {
        customData: {
          feeToken: feeToken.addr,
        },
      });
      await submitExecution(tx, resp);
    },
    [deploy, feeToken.addr, safe.contract, submitExecution],
  );

  return execute;
};
