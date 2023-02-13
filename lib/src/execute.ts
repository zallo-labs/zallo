import { BigNumber, Overrides } from 'ethers';
import { Account } from './contracts';
import { toAccountSignature, Signer } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { TransactionStruct } from './contracts/Account';
import { Quorum } from './quorum';
import { Tx } from './tx';
import { EMPTY_BYTES } from './bytes';
import { tryOrAsync } from './util/try';

const FALLBACK_BASE_GAS = BigNumber.from(500_000);
const GAS_PER_SIGNER = BigNumber.from(200_000);

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
  const minimalTx = {
    to: tx.to,
    value: tx.value,
    data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data ?? EMPTY_BYTES]),
  } satisfies TransactionRequest;

  const opGas =
    tx.gasLimit || (await tryOrAsync(() => provider.estimateGas(minimalTx), FALLBACK_BASE_GAS));
  const gasLimit = opGas.add(GAS_PER_SIGNER.mul(signers.length));

  return {
    ...minimalTx,
    from: account.address,
    type: EIP712_TX_TYPE,
    nonce: await provider.getTransactionCount(account.address),
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(),
    gasLimit,
    customData: {
      gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
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
export const toTransactionStruct = (r: TransactionRequest): TransactionStruct => ({
  txType: r.type!,
  from: r.from!,
  to: r.to!,
  value: r.value!,
  nonce: r.nonce!,
  data: r.data!,
  reserved: [r.nonce!, r.value!, 0, 0],
  signature: r.customData!.customSignature!,
  gasLimit: r.gasLimit!,
  gasPerPubdataByteLimit: r.gasPrice ?? 1,
  maxFeePerGas: r.maxFeePerGas ?? 1,
  maxPriorityFeePerGas: r.maxPriorityFeePerGas ?? 1,
  paymaster: 0,
  factoryDeps: [],
  paymasterInput: '0x',
  reservedDynamic: '0x',
});
