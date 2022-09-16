import { useMemo } from 'react';
import { Proposal } from '~/queries/proposal';
import { CombinedWallet } from '~/queries/wallets';

export const useTransactionIsApproved = (
  tx: Proposal,
  wallet: CombinedWallet,
) => {
  const approvers = useMemo(
    () => new Set(tx.approvals.map((a) => a.addr)),
    [tx],
  );

  return useMemo(
    () =>
      wallet.quorums.some((quorum) =>
        quorum.approvers.every((a) => approvers.has(a)),
      ),
    [approvers, wallet?.quorums],
  );
};
