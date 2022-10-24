import { Address } from 'lib';
import { useMemo } from 'react';
import { useTxContext } from '../TransactionProvider';

export const useTransactionApprovers = () => {
  const {
    config,
    proposal: { approvals },
  } = useTxContext();

  return useMemo(
    () =>
      config.approvers.reduce(
        ({ approved, notApproved }, approver) => {
          const hasApproved = !!approvals.find((a) => a.addr === approver);
          (hasApproved ? approved : notApproved).add(approver);

          return { approved, notApproved };
        },
        {
          approved: new Set<Address>(),
          notApproved: new Set<Address>(),
        },
      ),
    [approvals, config.approvers],
  );
};

export const useTransactionIsApproved = () =>
  useTransactionApprovers().notApproved.size === 0;
