import {
  Approver,
  createTx,
  executeTx,
  Group,
  mapAsync,
  Tx,
  Safe,
  signTx,
  Signerish,
  TxDef,
} from 'lib';
import { TransactionStruct } from 'lib/src/contracts/contracts/ISafe';
import { allSigners } from './wallet';
import { BytesLike, defaultAbiCoder } from 'ethers/lib/utils';
import { Contract } from 'ethers';

export const getSigners = async (
  safe: Safe,
  approvers: Approver[],
  tx: Tx,
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

export const toSafeTransaction = (
  safe: Contract,
  txDef: TxDef,
  signature: BytesLike = "0x"
): TransactionStruct => {
  const tx = createTx(txDef);

  return {
    txType: 0,
    from: safe.address,
    to: tx.to,
    feeToken: 0,
    ergsLimit: 0,
    ergsPerPubdataByteLimit: 0,
    ergsPrice: 0,
    reserved: [0, tx.value, 0, 0, 0, 0],
    data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data]),
    signature,
    reservedDynamic: '0x',
  };
};
