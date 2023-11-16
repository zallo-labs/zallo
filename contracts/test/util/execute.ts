import { mapAsync, Account, signTx, Approval, Tx, Address } from 'lib';
import { WALLETS } from './wallet';

export const getApprovals = async (
  account: Account,
  approvers: Set<Address>,
  tx: Tx,
): Promise<Approval[]> =>
  mapAsync([...approvers], async (approver) => ({
    type: 'secp256k1',
    approver,
    signature: signTx(WALLETS.find((w) => w.address === approver)!, account.address, tx),
  }));
