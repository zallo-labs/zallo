import {
  createTx,
  executeTx,
  mapAsync,
  TxReq,
  Account,
  signTx,
  Signerish,
  TxDef,
  Quorum,
  Wallet,
} from 'lib';
import { allSigners } from './wallet';

export const getSigners = async (
  account: Account,
  quorum: Quorum,
  tx: TxReq,
): Promise<Signerish[]> =>
  mapAsync(quorum, async (approver) => ({
    approver,
    signature: await signTx(
      allSigners.find((w) => w.address === approver)!,
      account.address,
      tx,
    ),
  }));

export const execute = async (
  account: Account,
  wallet: Wallet,
  quorum: Quorum,
  txDef: TxDef,
) => {
  const tx = createTx(txDef);
  const signers = await getSigners(account, quorum, tx);

  return await executeTx(
    account,
    tx,
    wallet,
    signers,
  );
};
