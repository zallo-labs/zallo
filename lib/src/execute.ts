import { Overrides } from 'ethers';
import { Account } from './contracts';
import { encodeAccountSignature } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { Tx } from './tx';
import { estimateTxGas } from './gas';
import { Policy } from './policy';
import { Approval } from './approvals';

export interface ExecuteTxOptions {
  customData?: Overrides & Eip712Meta;
}

export interface TransactionRequestOptions {
  account: Account;
  tx: Tx;
  policy: Policy;
  approvals: Approval[];
  opts?: ExecuteTxOptions;
}

export const asTransactionRequest = async ({
  account: { address: from, provider },
  tx,
  policy,
  approvals,
  opts = {},
}: TransactionRequestOptions): Promise<TransactionRequest> => {
  const req: TransactionRequest = {
    to: tx.to,
    value: tx.value,
    data: tx.data,
    nonce: tx.nonce,
    from,
    type: EIP712_TX_TYPE,
    chainId: (await provider.getNetwork()).chainId,
    gasLimit: tx.gasLimit,
    gasPrice: await provider.getGasPrice(),
    customData: {
      gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      ...opts.customData,
      customSignature: encodeAccountSignature(policy, approvals),
    },
  };

  req.gasLimit ||= await estimateTxGas([provider, req], approvals.length);

  return req;
};

export const executeTx = async (opts: TransactionRequestOptions) => {
  const req = await asTransactionRequest(opts);
  return opts.account.provider.sendTransaction(zk.utils.serialize(req));
};
