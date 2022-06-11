import { useSafe } from '@features/safe/SafeProvider';
import { isPresent, PERCENT_THRESHOLD } from 'lib';
import { useCallback } from 'react';
import { CombinedGroup } from '~/queries';
import { ProposedTx } from '~/queries/tx/useTxs';

export const useGroupsReachedThreshold = () => {
  const { groups } = useSafe();

  const reached = useCallback(
    (tx: ProposedTx): CombinedGroup[] | false => {
      const groupsReached = groups.filter((g) => {
        const approversInGroup = tx.approvals
          .map((a) => g.approvers.find((ga) => ga.addr === a.addr))
          .filter(isPresent);

        const total = approversInGroup
          .map((a) => a.weight)
          .reduce((a, b) => a + b, 0);

        return total >= PERCENT_THRESHOLD;
      });

      return groupsReached.length ? groupsReached : false;
    },
    [groups],
  );

  return reached;
};
