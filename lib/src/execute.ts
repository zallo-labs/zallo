import { Overrides } from 'ethers';
import { Safe } from './contracts';
import { Groupish } from './group';
import { Tx } from './tx';
import { createTxSignature, Signerish } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';

const VERIFICATION_GAS = 20_000;

export interface ExecuteTxOptions {
  customData?: Overrides & Omit<Eip712Meta, 'aaParams'>;
}

export const executeTx = async (
  { address: safe, provider }: Safe,
  tx: Tx,
  group: Groupish,
  signers: Signerish[],
  opts: ExecuteTxOptions = {},
) => {
  const basicReq: TransactionRequest = {
    // Don't spread to avoid adding extra fields
    from: safe,
    to: tx.to,
    value: tx.value,
    data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data]),
  };

  const req: TransactionRequest = {
    ...basicReq,
    type: 0x71, // AA type, apparently this will be changed to 0x80 at some point
    nonce: await provider.getTransactionCount(safe),
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(),
    gasLimit: (await provider.estimateGas(basicReq)).add(VERIFICATION_GAS),
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
