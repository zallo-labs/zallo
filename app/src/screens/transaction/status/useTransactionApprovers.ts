import { Address } from 'lib';
import { useMemo } from 'react';
import { Proposal } from '~/queries/proposal';

export const useTransactionApprovers = ({ approvals, config }: Proposal) => {
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

export const useTransactionIsApproved = (proposal: Proposal) =>
  useTransactionApprovers(proposal).notApproved.size === 0;
