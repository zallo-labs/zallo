import { encodeAbiParameters } from 'viem';
import { TX_ABI, Tx, encodeTxStruct } from './tx';
import { Network } from 'chains';
import { SCHEDULED_TX } from './constants';
import { Address } from './address';
import { utils as zkUtils } from 'zksync-ethers';
import { CallParams } from './safe-viem';
import { AllOrNone } from './util';
import { Hex } from './bytes';

export type EncodeScheduledTransactionParams = {
  network: Network;
  account: Address;
  tx: Tx;
} & AllOrNone<{ paymaster: Address; paymasterInput: Hex }>;

export async function encodeScheduledTransaction({
  network,
  account,
  tx,
  ...params
}: EncodeScheduledTransactionParams): Promise<CallParams> {
  const { maxFeePerGas, maxPriorityFeePerGas } = await network.estimateFeesPerGas();

  const t = {
    type: 'eip712',
    account,
    to: SCHEDULED_TX,
    data: encodeAbiParameters([TX_ABI], [encodeTxStruct(tx)]),
  } as const;

  return {
    ...t,
    network,
    nonce: await network.getTransactionCount({ address: account }),
    gas: tx.gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPerPubdata: BigInt(zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT),
    customSignature: '0x00', // Empty signatures are not allowed by zksync
    ...params,
  };
}
