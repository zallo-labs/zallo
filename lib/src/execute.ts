import { BigNumber, ethers, Overrides } from 'ethers';
import { Account } from './contracts';
import { toAccountSignature, Signer } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { TransactionStruct } from './contracts/Account';
import { Quorum } from './quorum';
import { Tx } from './tx';

const toPartialTransactionRequest = (tx: Tx): TransactionRequest => ({
  // Don't spread to avoid adding extra fields
  to: tx.to,
  value: tx.value,
  data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data]),
  gasLimit: tx.gasLimit,
});

const FALLBACK_BASE_GAS = BigNumber.from(500_000);
const GAS_PER_SIGNER = 200_000;

export const estimateTxGas = async (
  tx: Tx | TransactionRequest,
  provider: ethers.providers.Provider,
  nSigners: number,
) => {
  const baseGas = await (async () => {
    if (tx.gasLimit) return BigNumber.from(tx.gasLimit);

    try {
      return await provider.estimateGas(tx);
    } catch (e) {
      console.warn('Failed to estimate base gas');
      return FALLBACK_BASE_GAS;
    }
  })();

  return baseGas.add(nSigners * GAS_PER_SIGNER);
};

export interface ExecuteTxOptions {
  customData?: Overrides & Eip712Meta;
}

export interface TransactionRequestOptions {
  account: Account;
  tx: Tx;
  quorum: Quorum;
  signers: Signer[];
  opts?: ExecuteTxOptions;
}

export const toTransactionRequest = async ({
  account,
  tx,
  quorum,
  signers,
  opts = {},
}: TransactionRequestOptions): Promise<TransactionRequest> => {
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
      customSignature: toAccountSignature(quorum, signers),
    },
  };
};

export const executeTx = async (opts: TransactionRequestOptions) => {
  const req = await toTransactionRequest(opts);
  return opts.account.provider.sendTransaction(zk.utils.serialize(req));
};

// For external transactions
export const toTransactionStruct = (r: TransactionRequest): TransactionStruct => {
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
