import { BigNumber, ethers, Overrides } from 'ethers';
import { Account } from './contracts';
import { isTxReq, TxReq } from './tx';
import { createTxSignature, Signer } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { TransactionStruct } from './contracts/Account';
import { User } from './user';

const toPartialTransactionRequest = (tx: TxReq): TransactionRequest => ({
  // Don't spread to avoid adding extra fields
  to: tx.to,
  value: tx.value,
  data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data]),
});

const FALLBACK_BASE_GAS = BigNumber.from(300_000);
const GAS_PER_SIGNER = 50_000;

export const estimateTxGas = async (
  tx: TxReq | TransactionRequest,
  provider: ethers.providers.Provider,
  nSigners: number,
) => {
  const req = isTxReq(tx) ? toPartialTransactionRequest(tx) : tx;

  let baseGas = FALLBACK_BASE_GAS;
  try {
    baseGas = await provider.estimateGas(req);
  } catch (e) {
    console.warn('Failed to estimate base gas');
  }

  return baseGas.add(nSigners * GAS_PER_SIGNER);
};

export interface ExecuteTxOptions {
  customData?: Overrides & Eip712Meta;
}

export const toTransactionRequest = async (
  account: Account,
  tx: TxReq,
  user: User,
  signers: Signer[],
  opts: ExecuteTxOptions = {},
): Promise<TransactionRequest> => {
  const provider = account.provider;
  const basicReq = toPartialTransactionRequest(tx);

  return {
    ...basicReq,
    from: account.address,
    type: EIP712_TX_TYPE,
    nonce: await provider.getTransactionCount(account.address),
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(),
    gasLimit: await estimateTxGas(basicReq, provider, signers.length),
    customData: {
      ergsPerPubdata: zk.utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
      ...opts.customData,
      customSignature: createTxSignature(user, signers),
    },
  };
};

export const executeTx = async (
  ...[account, ...args]: Parameters<typeof toTransactionRequest>
) => {
  const req = await toTransactionRequest(account, ...args);
  return account.provider.sendTransaction(zk.utils.serialize(req));
};

// For external transactions
export const toTransactionStruct = (
  r: TransactionRequest,
): TransactionStruct => {
  return {
    txType: r.type!,
    from: r.from!,
    to: r.to!,
    ergsLimit: r.gasLimit!,
    ergsPerPubdataByteLimit: r.gasPrice ?? 1,
    maxFeePerErg: r.maxFeePerGas ?? 1,
    maxPriorityFeePerErg: r.maxPriorityFeePerGas ?? 1,
    paymaster: 0,
    factoryDeps: [],
    paymasterInput: '0x',
    reserved: [r.nonce!, r.value!, 0, 0, 0, 0],
    data: r.data!,
    signature: r.customData!.customSignature!,
    reservedDynamic: '0x',
  };
};
