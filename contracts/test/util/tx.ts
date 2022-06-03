import * as zk from 'zksync-web3';
import { Address, compareAddresses, createOp, Safe, signTx, Op } from 'lib';
import { SignerStruct } from 'lib/src/contracts/Safe';
import { BytesLike } from 'ethers';

export async function createSignedTx(
  safe: Safe,
  groupHash: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op>,
): Promise<[Op, BytesLike, SignerStruct[]]>;

export async function createSignedTx(
  safe: Safe,
  groupHash: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op>[],
): Promise<[Op[], BytesLike, SignerStruct[]]>;

export async function createSignedTx(
  safe: Safe,
  groupHash: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op> | Partial<Op>[],
): Promise<[Op | Op[], BytesLike, SignerStruct[]]> {
  if (!Array.isArray(txOpts)) txOpts = [txOpts];

  const ops = txOpts.map(createOp);

  const signers = (
    await Promise.all(
      wallets.map(
        async (wallet): Promise<SignerStruct> => ({
          addr: wallet.address,
          signature: await signTx(wallet, safe, ...ops),
        }),
      ),
    )
  ).sort((a, b) => compareAddresses(a.addr as Address, b.addr as Address));

  return [ops.length > 1 ? ops : ops[0], groupHash, signers];
}
