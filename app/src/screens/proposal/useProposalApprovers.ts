import { Address } from 'lib';
import { useMemo } from 'react';
import { Approval, Proposal } from '~/queries/proposal';

export const useProposalApprovers = ({ proposer, approvals, rejected, config }: Proposal) =>
  useMemo(() => {
    const approvers = [proposer.addr, ...config.approvers].reduce(
      ({ approved, notApproved, rejected }, approver) => {
        const approval = approvals.find((a) => a.addr === approver);
        if (approval) {
          approved.set(approver, approval);
        } else {
          notApproved.add(approver);
        }

        return { approved, notApproved, rejected };
      },
      {
        approved: new Map<Address, Approval>(),
        notApproved: new Set<Address>(),
        rejected,
      },
    );

    return {
      ...approvers,
      isApproved: approvers.notApproved.size === 0 && approvers.rejected.size === 0,
    };
  }, [approvals, config.approvers, proposer.addr, rejected]);
