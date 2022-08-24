import { useMemo } from 'react';
import { Tx } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';

export const useTransactionIsApproved = (tx: Tx, wallet: CombinedWallet) => {
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
