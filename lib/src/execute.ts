import { Overrides } from 'ethers';
import { Account } from './contracts';
import { encodeAccountSignature, Approval } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { Tx } from './tx';
import { tryOrAsync } from './util/try';
import { Policy } from './policy';
import { asBigInt } from './bigint';

export const FALLBACK_GAS_LIMIT = 3_000_000n;
const GAS_PER_SIGNER = 200_000n;

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
  account,
  tx,
  policy,
  approvals,
  opts = {},
}: TransactionRequestOptions): Promise<TransactionRequest> => {
  const provider = account.provider;
  const req: TransactionRequest = {
    to: tx.to,
    value: tx.value,
    data: tx.data,
    nonce: tx.nonce.toString(),
    from: account.address,
    type: EIP712_TX_TYPE,
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(),
    customData: {
      gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      ...opts.customData,
      customSignature: encodeAccountSignature(policy, approvals),
    },
  };

  const opGas =
    tx.gasLimit ||
    (await tryOrAsync(async () => asBigInt(await provider.estimateGas(req)), FALLBACK_GAS_LIMIT));
  req.gasLimit = opGas + GAS_PER_SIGNER * BigInt(approvals.length);

  return req;
};

export const executeTx = async (opts: TransactionRequestOptions) => {
  const req = await asTransactionRequest(opts);
  return opts.account.provider.sendTransaction(zk.utils.serialize(req));
};
