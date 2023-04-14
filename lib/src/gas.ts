import * as zk from 'zksync-web3';
import { TransactionRequest } from 'zksync-web3/build/src/types';
import { tryOrAsync } from './util/try';
import { asBigInt } from './bigint';

export const FALLBACK_GAS_LIMIT = 3_000_000n;
const GAS_PER_SIGNER = 200_000n;

export const estimateOpGas = async (provider: zk.Provider, req: TransactionRequest) =>
  tryOrAsync(async () => asBigInt(await provider.estimateGas(req)), FALLBACK_GAS_LIMIT);

type TxGasOptions = { opGasLimit: bigint } | Parameters<typeof estimateOpGas>;

export const estimateTxGas = async (options: TxGasOptions, approvers: number) => {
  const opGasLimit = Array.isArray(options) ? await estimateOpGas(...options) : options.opGasLimit;
  return opGasLimit + GAS_PER_SIGNER * BigInt(approvers);
};
