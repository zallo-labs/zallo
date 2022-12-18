import { toTx, executeTx, mapAsync, TxReq, Account, signTx, Signer, TxDef, Quorum } from 'lib';
import { SIGNERS } from './wallet';

export const getSigners = async (account: Account, quorum: Quorum, tx: TxReq): Promise<Signer[]> =>
  mapAsync([...quorum.approvers], async (approver) => ({
    approver,
    signature: await signTx(SIGNERS.find((w) => w.address === approver)!, account.address, tx),
  }));

export const execute = async (account: Account, quorum: Quorum, txDef: TxDef) => {
  const tx = toTx(txDef);

  return await executeTx({
    account,
    quorum,
    signers: await getSigners(account, quorum, tx),
    tx,
  });
};
