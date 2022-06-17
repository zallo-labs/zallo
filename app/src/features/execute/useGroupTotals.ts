import { useSafe } from '@features/safe/SafeProvider';
import { memoizedHookCallbackResult } from '@util/memoizedHookCallbackResult';
import { useCallback } from 'react';
import { ProposedTx } from '~/queries/tx/useTxs';

export const useGetGroupTotals = () => {
  const { groups } = useSafe();

  return useCallback(
    (tx: ProposedTx) =>
      groups.map((g) => {
        const txApprovers = new Set(tx.approvals?.map((a) => a.addr));

        const approvers = g.approvers.filter((ga) => txApprovers.has(ga.addr));

        return { group: g, total: approvers.reduce((a, b) => a + b.weight, 0) };
      }),
    [groups],
  );
};

export const useGroupTotals = memoizedHookCallbackResult(useGetGroupTotals);
