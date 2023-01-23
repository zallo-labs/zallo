import { toTx, executeTx, mapAsync, Account, signTx, Signer, Quorum, Tx, TxOptions } from 'lib';
import { SIGNERS } from './wallet';

export const getSigners = async (account: Account, quorum: Quorum, tx: Tx): Promise<Signer[]> =>
  mapAsync([...quorum.approvers], async (approver) => ({
    approver,
    signature: await signTx(SIGNERS.find((w) => w.address === approver)!, account.address, tx),
  }));

export const execute = async (account: Account, quorum: Quorum, txOpts: TxOptions) => {
  const tx = toTx(txOpts);

  return await executeTx({
    account,
    quorum,
    signers: await getSigners(account, quorum, tx),
    tx,
  });
};
