import { memoizedHookCallbackResult } from '@util/memoizedHookCallbackResult';
import { PERCENT_THRESHOLD } from 'lib';
import { useCallback } from 'react';
import { CombinedWallet } from '~/queries/wallets';
import { ProposedTx } from '~/queries/tx';
import { useGetGroupTotals } from './useGroupTotals';

export const useGetGroupsApproved = () => {
  const getTotals = useGetGroupTotals();

  return useCallback(
    (tx: ProposedTx): CombinedWallet[] | false => {
      const groupsReached = getTotals(tx)
        .filter(({ total }) => total >= PERCENT_THRESHOLD)
        .map(({ group }) => group);

      return groupsReached.length ? groupsReached : false;
    },
    [getTotals],
  );
};

export const useGroupsApproved =
  memoizedHookCallbackResult(useGetGroupsApproved);
