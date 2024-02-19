import { encodeAbiParameters } from 'viem';
import { TX_ABI, Tx, encodeTxStruct } from './tx';
import { Network } from 'chains';
import { SCHEDULED_TX } from './constants';
import { Address } from './address';
import { utils as zkUtils } from 'zksync-ethers';
import { CallParams } from './safe-viem';

export interface EncodeScheduledTransactionParams {
  network: Network;
  account: Address;
  tx: Tx;
}

export async function encodeScheduledTransaction({
  network,
  account,
  tx,
}: EncodeScheduledTransactionParams): Promise<CallParams> {
  const { maxFeePerGas, maxPriorityFeePerGas } = await network.estimateFeesPerGas();

  return {
    network,
    type: 'eip712',
    to: SCHEDULED_TX,
    data: encodeAbiParameters([TX_ABI], [encodeTxStruct(tx)]),
    account,
    nonce: await network.getTransactionCount({ address: account }),
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPerPubdata: BigInt(zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT),
  };
}
