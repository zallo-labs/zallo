import { ethers, Overrides } from 'ethers';
import { Safe } from './contracts';
import { Groupish } from './group';
import { isTxReq, TxReq } from './tx';
import { createTxSignature, Signerish } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';

const toTransactionRequest = (tx: TxReq): TransactionRequest => ({
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
  const req = isTxReq(tx) ? toTransactionRequest(tx) : tx;
  const baseGas = await provider.estimateGas(req);

  const extraGas = (nSigners - 1) * EXTRA_VERIFICATION_GAS_PER_SIGNER;

  return baseGas.add(extraGas);
};

export interface ExecuteTxOptions {
  customData?: Overrides & Omit<Eip712Meta, 'aaParams'>;
}

export const executeTx = async (
  { address: safe, provider }: Safe,
  tx: TxReq,
  group: Groupish,
  signers: Signerish[],
  opts: ExecuteTxOptions = {},
) => {
  const basicReq = toTransactionRequest(tx);

  const req: TransactionRequest = {
    ...basicReq,
    from: safe,
    type: EIP712_TX_TYPE,
    nonce: await provider.getTransactionCount(safe),
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(opts.customData?.feeToken),
    gasLimit: await estimateTxGas(basicReq, provider, signers.length),
    customData: {
      feeToken: zk.utils.ETH_ADDRESS,
      ...opts.customData,
      aaParams: {
        from: safe,
        signature: createTxSignature(group, signers),
      },
    },
  };

  return provider.sendTransaction(zk.utils.serialize(req));
};
