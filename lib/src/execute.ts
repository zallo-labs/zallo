import { BigNumber, Overrides } from 'ethers';
import { Account } from './contracts';
import { toAccountSignature, Signer } from './signature';
import * as zk from 'zksync-web3';
import { Eip712Meta, TransactionRequest } from 'zksync-web3/build/src/types';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { EIP712_TX_TYPE } from 'zksync-web3/build/src/utils';
import { Quorum } from './quorum';
import { Tx } from './tx';
import { EMPTY_BYTES } from './bytes';
import { tryOrAsync } from './util/try';

export const FALLBACK_GAS_LIMIT = BigNumber.from(3_000_000);
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
  const req: TransactionRequest = {
    to: tx.to,
    value: tx.value,
    data: defaultAbiCoder.encode(['bytes8', 'bytes'], [tx.salt, tx.data ?? EMPTY_BYTES]),
    from: account.address,
    type: EIP712_TX_TYPE,
    nonce: await provider.getTransactionCount(account.address),
    chainId: (await provider.getNetwork()).chainId,
    gasPrice: await provider.getGasPrice(),
    customData: {
      gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      ...opts.customData,
      customSignature: toAccountSignature(quorum, signers),
    },
  };

  const opGas =
    tx.gasLimit || (await tryOrAsync(() => provider.estimateGas(req), FALLBACK_GAS_LIMIT));
  req.gasLimit = opGas.add(GAS_PER_SIGNER.mul(signers.length));

  return req;
};

export const executeTx = async (opts: TransactionRequestOptions) => {
  const req = await toTransactionRequest(opts);
  return opts.account.provider.sendTransaction(zk.utils.serialize(req));
};
