import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { Contract, ethers } from 'ethers';
import { Wallet } from 'zksync-web3';
import { Safe } from './contracts';

export type SignedTx = Parameters<Safe['execute']>[0];
export type Tx = SignedTx['tx'];

const EIP712_TX_TYPE: Record<string, TypedDataField[]> = {
  Tx: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
  ],
};

export const getDomain = async (
  contract: Contract,
): Promise<TypedDataDomain> => ({
  // chainId: (await contract.provider.getNetwork()).chainId,
  chainId: 0, // zksync FIXME: block.chainid always returns 0 - https://v2-docs.zksync.io/dev/zksync-v2/temp-limits.html#unsupported-opcodes
  verifyingContract: contract.address,
});

export const hashTx = async (tx: Tx, contract: Contract) =>
  ethers.utils._TypedDataEncoder.hash(
    await getDomain(contract),
    EIP712_TX_TYPE,
    tx,
  );

export const signTx = async (wallet: Wallet, safe: Safe, tx: Tx) =>
  wallet._signTypedData(await getDomain(safe), EIP712_TX_TYPE, tx);

export const createTx = (tx: Partial<Tx>): Tx => ({
  to: '0x0000000000000000000000000000000000000000',
  value: 0,
  data: [],
  nonce: 5, // TODO: generated random number
  ...tx,
});
