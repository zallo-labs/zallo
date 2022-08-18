import { ethers, Overrides } from 'ethers';
import { Account } from './contracts';
import { isTxReq, TxReq } from './tx';
import { createTxSignature, Signerish } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { TransactionStruct } from './contracts/Account';
import { Wallet } from './wallet';

const toPartialTransactionRequest = (tx: TxReq): TransactionRequest => ({
  // Don't spread to avoid adding extra fields
  to: tx.to,
  value: tx.value,
  data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data]),
});

const GAS_PER_SIGNER = 15_000;

export const estimateTxGas = async (
  tx: TxReq | TransactionRequest,
  provider: ethers.providers.Provider,
  nSigners: number,
) => {
  const req = isTxReq(tx) ? toPartialTransactionRequest(tx) : tx;
  const baseGas = await provider.estimateGas(req);

  const extraGas = nSigners * GAS_PER_SIGNER;

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
  account: Account,
  tx: TxReq,
  wallet: Wallet,
  signers: Signerish[],
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
    gasPrice: await provider.getGasPrice(opts.customData?.feeToken),
    gasLimit: await estimateTxGas(basicReq, provider, signers.length),
    customData: {
      feeToken: zk.utils.ETH_ADDRESS,
      ...opts.customData,
      aaParams: {
        from: account.address,
        signature: createTxSignature(wallet, signers),
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
