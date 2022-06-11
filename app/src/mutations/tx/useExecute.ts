import { useWallet } from '@features/wallet/useWallet';
import { MaybePromise, Op } from 'lib';
import { useCallback } from 'react';
import { ExecutedTx, isExecutedTx, isTx, ProposedTx } from '~/queries/tx/useTxs';
import { useApproveTx } from './useApproveTx.api';
import { useGroupsReachedThreshold } from './useGroupsReachedThreshold';
import { useSubmitExecute } from './submit/useSubmitExecute';
import { useProposeTx } from './useProposeTx.api';

export type ProposedTxish = ProposedTx | Op | Op[];

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
  const groupsReachedThreshold = useGroupsReachedThreshold();
  const submit = useSubmitExecute();
  const propose = useProposeTx();

  const getExecute = useCallback(
    (tx: ProposedTxish | ExecutedTx): ExecuteFunc => {
      // Op | Op[]
      if (!isTx(tx))
        return asEf('propose', () =>
          propose(...(Array.isArray(tx) ? tx : [tx])),
        );

      if (isExecutedTx(tx)) return undefined;

      // Approve if user hasn't approved
      const userHasApproved = !!tx.approvals.find(
        (a) => a.addr === wallet.address,
      );
      if (!userHasApproved) return asEf('approve', () => approve(tx));

      // Execute if threshold has been reached
      const groupsReached = groupsReachedThreshold(tx);
      if (!groupsReached)
        return asEf('await-approval', () => {
          throw new Error('Execute called during await-approval step');
        });

      const group = groupsReached[0];

      return asEf('execute', () => submit(tx, group));
    },
    [groupsReachedThreshold, propose, wallet.address, approve, submit],
  );

  return getExecute;
};

export const useExecute = (tx: ProposedTxish) => useGetExecute()(tx);
