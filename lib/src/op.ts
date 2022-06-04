import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { BytesLike, ethers } from 'ethers';
import { Wallet } from 'zksync-web3';
import { Address } from './addr';
import { Safe } from './contracts';
import { SignerStruct } from './contracts/Safe';

export type Op = Parameters<Safe['execute']>[0];

export interface SignedOp {
  tx: Op;
  groupHash: BytesLike;
  signers: SignerStruct[];
}

export interface SignedOps {
  txs: Op[];
  groupHash: BytesLike;
  signers: SignerStruct[];
}

const EIP712_TYPES_OP: Record<string, TypedDataField[]> = {
  Op: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
  ],
};

const EIP712_TYPES_OPS: Record<string, TypedDataField[]> = {
  Ops: [{ name: 'ops', type: 'Op[]' }],
  ...EIP712_TYPES_OP,
};

export const getDomain = async (
  verifyingContract: Address,
): Promise<TypedDataDomain> => ({
  // chainId: (await contract.provider.getNetwork()).chainId,
  chainId: 0, // ZKSYNC: block.chainid always returns 0 - https://v2-docs.zksync.io/dev/zksync-v2/temp-limits.html#unsupported-opcodes
  verifyingContract,
});

const typedDataParams = (
  ops: Op[],
): [Record<string, TypedDataField[]>, Record<string, any>] => {
  if (ops.length === 0) throw new Error("Can't hash empty array of operations");

  return ops.length === 1
    ? [EIP712_TYPES_OP, ops[0]]
    : [EIP712_TYPES_OPS, { ops }];
};

export const hashTx = async (contract: Address, ...ops: Op[]) =>
  ethers.utils._TypedDataEncoder.hash(
    await getDomain(contract),
    ...typedDataParams(ops),
  );

export const signTx = async (wallet: Wallet, safe: Address, ...ops: Op[]) =>
  wallet._signTypedData(await getDomain(safe), ...typedDataParams(ops));

export const createOp = (op: Partial<Op>): Op => ({
  to: '0x0000000000000000000000000000000000000000',
  value: 0,
  data: [],
  nonce: 0, // TODO: generated random number
  ...op,
});
