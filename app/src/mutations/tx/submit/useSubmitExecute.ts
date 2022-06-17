import { useSafe } from '@features/safe/SafeProvider';
import { Overrides } from 'ethers';
import { toSafeSigners } from 'lib';
import { useCallback } from 'react';
import { CombinedGroup } from '~/queries';
import { ProposedTx } from '~/queries/tx/useTxs';
import { USDC } from '~/token/tokens';
import { useApiSubmitExecution } from './useApiSubmitExecution';

const overrides: Overrides = {
  gasLimit: 50000,
  // https://v2-docs.zksync.io/api/js/features.html#overrides
  customData: {
    feeToken: USDC.addr,
  },
};

export const useSubmitExecute = () => {
  const { safe } = useSafe();
  const submitExecution = useApiSubmitExecution();

  const execute = useCallback(
    async (tx: ProposedTx, group: CombinedGroup) => {
      const signers = toSafeSigners(
        tx.approvals.filter((a) =>
          group.approvers.find((ga) => ga.addr === a.addr),
        ),
      );

      console.log('Executing', {
        tx,
        group,
        signers,
      });

      const resp =
        tx.ops.length === 1
          ? await safe.execute(tx.ops[0], group.hash, signers, overrides)
          : await safe.multiExecute(tx.ops, group.hash, signers, overrides);

      await submitExecution(tx, resp);
    },
    [safe, submitExecution],
  );

  return execute;
};
