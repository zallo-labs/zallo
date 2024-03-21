import { Tx } from './tx';
import {
  FALLBACK_OPERATIONS_GAS,
  estimateTransactionOperationsGas,
  estimateTransactionVerificationGas,
} from './gas';
import { Address } from './address';
import { Network } from 'chains';
import { Hex } from 'viem';
import { AllOrNone } from './util';
import { utils as zkUtils } from 'zksync-ethers';
import { encodeOperations } from './operation';
import { CallParams } from './safe-viem';

export type TxProposalCallParamsOptions = Partial<
  Pick<
    CallParams,
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

export async function encodeTransaction({
  network,
  account,
  tx,
  ...params
}: TxProposalCallParamsOptions): Promise<CallParams> {
  const { maxFeePerGas, maxPriorityFeePerGas } = await network.estimateFeesPerGas();
  const gas =
    tx.gas ??
    (await estimateTransactionOperationsGas({
      network,
      account,
      operations: tx.operations,
    }).unwrapOr(FALLBACK_OPERATIONS_GAS)) + estimateTransactionVerificationGas(1);

  return {
    network,
    ...encodeOperations(tx.operations),
    type: 'eip712',
    account,
    nonce: await network.getTransactionCount({ address: account }),
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPerPubdata: BigInt(zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT),
    gas,
    ...params,
  };
}
