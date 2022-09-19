import { useMemo } from 'react';
import { Proposal } from '~/queries/proposal';
import { CombinedUser } from '~/queries/user/useUser.api';

export const useTransactionIsApproved = (
  proposal: Proposal,
  proposer: CombinedUser,
) =>
  useMemo(() => {
    const approvers = new Set(proposal.approvals.map((a) => a.addr));

    return (proposer.configs.active ?? []).some((config) =>
      config.approvers.every((a) => approvers.has(a)),
    );
  }, [proposal.approvals, proposer.configs.active]);
