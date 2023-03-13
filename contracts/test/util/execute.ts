import { executeTx, mapAsync, Account, signTx, Approval, Tx, Policy, Address } from 'lib';
import { WALLETS } from './wallet';

export const getApprovals = async (
  account: Account,
  approvers: Set<Address>,
  tx: Tx,
): Promise<Approval[]> =>
  mapAsync([...approvers], async (approver) => ({
    approver,
    signature: await signTx(WALLETS.find((w) => w.address === approver)!, account.address, tx),
  }));

export const execute = async (
  account: Account,
  policy: Policy,
  approvers: Set<Address>,
  tx: Tx,
) => {
  return await executeTx({
    account,
    policy,
    approvals: await getApprovals(account, approvers, tx),
    tx,
  });
};
