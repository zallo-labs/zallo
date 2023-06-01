import { BigNumber, Overrides } from 'ethers';
import { Account } from './contracts';
import { encodeAccountSignature } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest, TransactionResponse } from 'zksync-web3/build/src/types';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { Tx } from './tx';
import { estimateTxGas } from './gas';
import { Policy } from './policy';
import { Approval } from './approvals';

export interface TransactionRequestOptions {
  account: Account;
  tx: Tx;
  policy: Policy;
  approvals: Approval[];
  customData?: Overrides & Eip712Meta;
  gasPrice?: bigint;
}

const asTransactionRequest = async ({
  account: { address: from, provider },
  tx,
  policy,
  approvals,
  customData,
  gasPrice,
}: TransactionRequestOptions): Promise<TransactionRequest> => {
  const request: TransactionRequest = {
    to: tx.to,
    value: tx.value,
    data: tx.data,
    nonce: await provider.getTransactionCount(from),
    from,
    type: EIP712_TX_TYPE,
    chainId: (await provider.getNetwork()).chainId,
    gasLimit: tx.gasLimit,
    gasPrice: gasPrice ? BigNumber.from(gasPrice) : await provider.getGasPrice(),
    customData: {
      gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      ...customData,
      customSignature: encodeAccountSignature(tx, policy, approvals),
    },
  };

  request.gasLimit ||= await estimateTxGas([provider, request], approvals.length);

  return request;
};

export const executeTx = async (opts: TransactionRequestOptions): Promise<TransactionResponse> => {
  const request = await asTransactionRequest(opts);
  return opts.account.provider.sendTransaction(zk.utils.serialize(request));
};
