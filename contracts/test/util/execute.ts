import {
  Approver,
  createTx,
  executeTx,
  Group,
  mapAsync,
  TxReq,
  Safe,
  signTx,
  Signerish,
  TxDef,
} from 'lib';
import { allSigners } from './wallet';

export const getSigners = async (
  safe: Safe,
  approvers: Approver[],
  tx: TxReq,
): Promise<Signerish[]> =>
  mapAsync(approvers, async (approver) => ({
    ...approver,
    signature: await signTx(
      allSigners.find((w) => w.address === approver.addr)!,
      safe.address,
      tx,
    ),
  }));

export const execute = async (
  safe: Safe,
  group: Group,
  approvers: Approver[],
  txDef: TxDef,
) => {
  const tx = createTx(txDef);
  const signers = await getSigners(safe, approvers, tx);

  return await executeTx(
    safe,
    tx,
    group,
    signers,
    // { customData: { feeToken: USDC } }
  );
};
