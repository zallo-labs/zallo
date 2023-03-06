import {
  toTx,
  executeTx,
  mapAsync,
  Account,
  signTx,
  Approval,
  Tx,
  TxOptions,
  Rule,
  Address,
} from 'lib';
import { WALLETS } from './wallet';

export const getApprovals = async (
  account: Account,
  approvers: Set<Address>,
  tx: Tx,
): Promise<Approval[]> =>
  mapAsync([...approvers], async (approver) => ({
    signer: approver,
    signature: await signTx(WALLETS.find((w) => w.address === approver)!, account.address, tx),
  }));

export const execute = async (
  account: Account,
  rule: Rule,
  approvers: Set<Address>,
  txOpts: TxOptions,
) => {
  const tx = toTx(txOpts);

  return await executeTx({
    account,
    rule,
    approvals: await getApprovals(account, approvers, tx),
    tx,
  });
};
