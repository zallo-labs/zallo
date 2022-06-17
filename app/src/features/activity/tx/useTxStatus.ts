import { useSafe } from '@features/safe/SafeProvider';
import { PERCENT_THRESHOLD, Signer } from 'lib';
import { useCallback } from 'react';

export const useIsApproved = () => {
  const { groups } = useSafe();

  const group = groups[0];

  const isApproved = useCallback(
    (approvals: Signer[]) => {
      const total = approvals.reduce((sum, signer) => {
        const weight =
          group.approvers.find((a) => a.addr === signer.addr)?.weight ?? 0;
        return sum + weight;
      }, 0);

      return total >= PERCENT_THRESHOLD;
    },
    [group.approvers],
  );

  return { isApproved };
};
