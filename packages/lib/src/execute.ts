import { Tx } from './tx';
import {
  FALLBACK_OPERATIONS_GAS,
  estimateTransactionOperationsGas,
  estimateTransactionVerificationGas,
} from './gas';
import { Address } from './address';
import { ChainConfig, Network } from 'chains';
import { ResultAsync } from 'neverthrow';
import { CallErrorType, CallParameters, Hex, SendTransactionErrorType } from 'viem';
import { AllOrNone } from './util';
import { utils as zkUtils } from 'zksync-ethers';
import { encodeOperations } from './operation';
import { asHex } from './bytes';

type TransactionParams = CallParameters<ChainConfig>;
export type TxProposalCallParamsOptions = Partial<
  Pick<
    TransactionParams,
    | 'customSignature'
    | 'maxFeePerGas'
    | 'maxPriorityFeePerGas'
    | 'factoryDeps'
    | 'accessList'
    | 'blockNumber'
  >
> &
  AllOrNone<{ paymaster: Address; paymasterInput: Hex }> & {
    network: Network;
    account: Address;
    tx: Tx;
  };

export async function txProposalCallParams({
  network,
  account,
  tx,
  ...params
}: TxProposalCallParamsOptions) {
  const { to, value, data } = encodeOperations(account, tx.operations);
  const { maxFeePerGas, maxPriorityFeePerGas } = await network.estimateFeesPerGas();
  const gas =
    tx.gas ??
    (await estimateTransactionOperationsGas({ network, account, tx }).unwrapOr(
      FALLBACK_OPERATIONS_GAS,
    )) + estimateTransactionVerificationGas(1);

  return {
    type: 'eip712',
    account,
    to,
    value,
    data,
    nonce: await network.getTransactionCount({ address: account }),
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPerPubdata: BigInt(zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT),
    gas,
    ...params,
  } satisfies TransactionParams;
}
type TxProposalCallParams = Awaited<ReturnType<typeof txProposalCallParams>>;

export type ExecuteTransactionParams = TxProposalCallParamsOptions &
  Required<Pick<TxProposalCallParamsOptions, 'customSignature'>>;

export async function executeTransaction(params: ExecuteTransactionParams) {
  const network = params.network;
  const p = await txProposalCallParams(params);

  return ResultAsync.fromPromise(network.call(p), (e) => e as CallErrorType).andThen(
    ({ data: callResponse }) =>
      new ResultAsync(_executeTransactionUnsafe(network, p)).map(({ transactionHash }) => ({
        transactionHash,
        callResponse: asHex(callResponse),
      })),
  );
}

export async function executeTransactionUnsafe(params: ExecuteTransactionParams) {
  return _executeTransactionUnsafe(params.network, await txProposalCallParams(params));
}

async function _executeTransactionUnsafe(network: Network, p: TxProposalCallParams) {
  return ResultAsync.fromPromise(
    network.sendRawTransaction({
      serializedTransaction: network.chain.serializers!.transaction!({
        ...p,
        from: p.account,
        chainId: network.chain.id,
      }),
    }),
    (e) => e as SendTransactionErrorType,
  ).map((transactionHash) => ({
    transactionHash: asHex(transactionHash),
  }));
}
