import { useAccount } from '@features/account/AccountProvider';
import { memoizedHookCallbackResult } from '@util/memoizedHookCallbackResult';
import { useCallback } from 'react';
import { ProposedTx } from '~/queries/tx';

export const useGetGroupTotals = () => {
  const { groups } = useAccount();

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
