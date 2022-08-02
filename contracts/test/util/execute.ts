import {
  createTx,
  executeTx,
  mapAsync,
  TxReq,
  Safe,
  signTx,
  Signerish,
  TxDef,
  Quorum,
  Account,
} from 'lib';
import { allSigners } from './wallet';

export const getSigners = async (
  safe: Safe,
  quorum: Quorum,
  tx: TxReq,
): Promise<Signerish[]> =>
  mapAsync(quorum, async (approver) => ({
    approver,
    signature: await signTx(
      allSigners.find((w) => w.address === approver)!,
      safe.address,
      tx,
    ),
  }));

export const execute = async (
  safe: Safe,
  account: Account,
  quorum: Quorum,
  txDef: TxDef,
) => {
  const tx = createTx(txDef);
  const signers = await getSigners(safe, quorum, tx);

  return await executeTx(
    safe,
    tx,
    account,
    signers,
    // { customData: { feeToken: USDC } }
  );
};
