import { ethers, Overrides } from 'ethers';
import { Safe } from './contracts';
import { Groupish } from './group';
import { isTxReq, TxReq } from './tx';
import { createTxSignature, Signerish } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { TransactionStruct } from './contracts/contracts/Safe';

const toPartialTransactionRequest = (tx: TxReq): TransactionRequest => ({
  // Don't spread to avoid adding extra fields
  to: tx.to,
  value: tx.value,
  data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data]),
});

const EXTRA_VERIFICATION_GAS_PER_SIGNER = 10_000;

export const estimateTxGas = async (
  tx: TxReq | TransactionRequest,
  provider: ethers.providers.Provider,
  nSigners: number,
) => {
  const req = isTxReq(tx) ? toPartialTransactionRequest(tx) : tx;
  const baseGas = await provider.estimateGas(req);

  const extraGas = (nSigners - 1) * EXTRA_VERIFICATION_GAS_PER_SIGNER;

  return baseGas.add(extraGas);
};

export const toTransactionStruct = (
  r: TransactionRequest,
): TransactionStruct => {
  return {
    txType: r.type!,
    from: r.from!,
    to: r.to!,
    feeToken: 0,
    ergsLimit: r.gasLimit!,
    ergsPerPubdataByteLimit: 5,
    ergsPrice: r.gasPrice!,
    reserved: [r.nonce!, r.value!, 0, 0, 0, 0],
    data: r.data!,
    signature: r.customData!.aaParams!.signature!,
    reservedDynamic: '0x',
  };
};

export interface ExecuteTxOptions {
  customData?: Overrides & Omit<Eip712Meta, 'aaParams'>;
}

export const toTransactionRequest = async (
  safe: Safe,
  tx: TxReq,
  group: Groupish,
  signers: Signerish[],
  opts: ExecuteTxOptions = {},
): Promise<TransactionRequest> => {
  const provider = safe.provider;
  const basicReq = toPartialTransactionRequest(tx);

  return {
    ...basicReq,
    from: safe.address,
    type: EIP712_TX_TYPE,
    nonce: await provider.getTransactionCount(safe.address),
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(opts.customData?.feeToken),
    gasLimit: await estimateTxGas(basicReq, provider, signers.length),
    customData: {
      feeToken: zk.utils.ETH_ADDRESS,
      ...opts.customData,
      aaParams: {
        from: safe.address,
        signature: createTxSignature(group, signers),
      },
    },
  };
};

export const executeTx = async (
  ...args: Parameters<typeof toTransactionRequest>
) => {
  const req = await toTransactionRequest(...args);

  // TODO: re-enable AA executions once AA verification can call other contracts; required due to use of a proxy; https://v2-docs.zksync.io/dev/zksync-v2/aa.html#building-custom-accounts
  // return provider.sendTransaction(zk.utils.serialize(req));

  return args[0].executeTransactionFromOutside(toTransactionStruct(req));
};
