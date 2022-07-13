import { useSafe } from '@features/safe/SafeProvider';
import { PERCENT_THRESHOLD } from 'lib';
import { useCallback } from 'react';
import { Approval } from '~/queries/tx';

export const useIsApproved = () => {
  const { groups } = useSafe();

  const group = groups[0];

  const isApproved = useCallback(
    (approvals: Approval[]) => {
      const total = approvals.reduce((sum, approval) => {
        const weight =
          group.approvers.find((a) => a.addr === approval.addr)?.weight ?? 0;
        return sum + weight;
      }, 0);

      return total >= PERCENT_THRESHOLD;
    },
    [group.approvers],
  );

  return { isApproved };
};
