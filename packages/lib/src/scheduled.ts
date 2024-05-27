import { encodeAbiParameters } from 'viem';
import { TX_ABI, Tx, encodeTxStruct } from './tx';
import { ChainConfig } from 'chains';
import { SCHEDULED_TX } from './constants';
import { SendTransactionParameters } from 'viem/zksync';

export interface AsScheduledSystemTransaction {
  tx: Tx;
}

export function asScheduledSystemTransaction({ tx }: AsScheduledSystemTransaction) {
  return {
    type: 'eip712',
    to: SCHEDULED_TX,
    data: encodeAbiParameters([TX_ABI], [encodeTxStruct(tx)]),
    gas: tx.gas,
    customSignature: '0x00', // Empty signatures are not allowed by zksync
  } satisfies Partial<SendTransactionParameters<ChainConfig>>;
}
