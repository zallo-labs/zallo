import { useWallet } from '@features/wallet/useWallet';
import { MaybePromise } from 'lib';
import { useCallback } from 'react';
import { isExecutedTx, Tx, TxStatus } from '~/queries/tx/useTxs';
import { useApproveTx } from '../../mutations/tx/useApproveTx.api';
import { useGetGroupsApproved } from './useGroupsApproved';
import { useSubmitExecute } from '../../mutations/tx/submit/useSubmitExecute';
import { useProposeApiTx } from '../../mutations/tx/useProposeApiTx.api';

export type ExecuteStep = 'propose' | 'approve' | 'await-approval' | 'execute';

type ExecuteFuncBase = () => MaybePromise<unknown>;
export type ExecuteFunc = ExecuteFuncBase & {
  step: ExecuteStep;
};

const asEf = (step: ExecuteStep, f: ExecuteFuncBase) => {
  const r = f as ExecuteFunc;
  r.step = step;
  return r;
};

export const useGetExecute = () => {
  const wallet = useWallet();
  const approve = useApproveTx();
  const getGroupsApproved = useGetGroupsApproved();
  const submit = useSubmitExecute();
  const propose = useProposeApiTx();

  const getExecute = useCallback(
    (tx: Tx): ExecuteFunc => {
      if (isExecutedTx(tx)) return undefined;

      if (tx.status === TxStatus.PreProposal)
        return asEf('propose', () => propose(tx));

      // Approve if user hasn't approved
      const userHasApproved = !!tx.approvals.find(
        (a) => a.addr === wallet.address,
      );
      if (!userHasApproved) return asEf('approve', () => approve(tx));

      // Execute if threshold has been reached
      const groups = getGroupsApproved(tx);
      if (!groups)
        return asEf('await-approval', () => {
          throw new Error('Execute called during await-approval step');
        });

      const group = groups[0];

      return asEf('execute', () => submit(tx, group));
    },
    [getGroupsApproved, propose, wallet.address, approve, submit],
  );

  return getExecute;
};

type ProposeArgs = Parameters<ReturnType<typeof useGetExecute>>;

export const useExecute = (...args: ProposeArgs) => useGetExecute()(...args);
