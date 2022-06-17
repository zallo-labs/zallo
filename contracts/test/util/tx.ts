import * as zk from 'zksync-web3';
import { createOp, Safe, signTx, Op, toSafeSigners, Signer } from 'lib';
import { SignerStruct } from 'lib/src/contracts/Safe';
import { BytesLike } from 'ethers';

export async function createSignedTx(
  safe: Safe,
  groupId: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op>,
): Promise<[Op, BytesLike, SignerStruct[]]>;

export async function createSignedTx(
  safe: Safe,
  groupId: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op>[],
): Promise<[Op[], BytesLike, SignerStruct[]]>;

export async function createSignedTx(
  safe: Safe,
  groupId: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op> | Partial<Op>[],
): Promise<[Op | Op[], BytesLike, SignerStruct[]]> {
  if (!Array.isArray(txOpts)) txOpts = [txOpts];

  const ops = txOpts.map(createOp);

  const signers = toSafeSigners(
    await Promise.all(
      wallets.map(
        async (wallet): Promise<Signer> => ({
          addr: wallet.address,
          signature: await signTx(wallet, safe.address, ...ops),
        }),
      ),
    ),
  );

  return [ops.length > 1 ? ops : ops[0], groupId, signers];
}
