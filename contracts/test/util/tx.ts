import * as zk from 'zksync-web3';
import {
  Address,
  compareAddresses,
  createOp,
  Safe,
  signOp,
  signOps,
  Op,
} from 'lib';
import { SignerStruct } from 'lib/src/contracts/Safe';
import { BytesLike } from 'ethers';

export const createSignedTx = async (
  safe: Safe,
  groupHash: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op>,
): Promise<[Op, BytesLike, SignerStruct[]]> => {
  const op = createOp(txOpts);

  const signers = (
    await Promise.all(
      wallets.map(
        async (wallet): Promise<SignerStruct> => ({
          addr: wallet.address,
          signature: await signOp(wallet, safe, op),
        }),
      ),
    )
  ).sort((a, b) => compareAddresses(a.addr as Address, b.addr as Address));

  return [op, groupHash, signers];
};

export const createSignedTxs = async (
  safe: Safe,
  groupHash: BytesLike,
  wallets: zk.Wallet[],
  txOpts: Partial<Op>[],
): Promise<[Op[], BytesLike, SignerStruct[]]> => {
  const ops = txOpts.map(createOp);

  const signers = (
    await Promise.all(
      wallets.map(
        async (wallet): Promise<SignerStruct> => ({
          addr: wallet.address,
          signature: await signOps(wallet, safe, ops),
        }),
      ),
    )
  ).sort((a, b) => compareAddresses(a.addr as Address, b.addr as Address));

  return [ops, groupHash, signers];
};
