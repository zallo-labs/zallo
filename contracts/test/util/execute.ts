import {
  createTx,
  executeTx,
  mapAsync,
  TxReq,
  Account,
  signTx,
  Signer,
  TxDef,
  User,
  UserConfig,
} from 'lib';
import { allSigners } from './wallet';

export const getSigners = async (
  account: Account,
  user: User,
  config: UserConfig,
  tx: TxReq,
): Promise<Signer[]> =>
  mapAsync([user.addr, ...config.approvers], async (approver) => ({
    approver,
    signature: await signTx(allSigners.find((w) => w.address === approver)!, account.address, tx),
  }));

export const execute = async (account: Account, user: User, config: UserConfig, txDef: TxDef) => {
  const tx = createTx(txDef);
  const signers = await getSigners(account, user, config, tx);

  return await executeTx(account, tx, user, signers);
};
