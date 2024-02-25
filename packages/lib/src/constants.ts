import { numberToHex } from 'viem';
import { asAddress } from './address';

export const TX_TYPE_OFFSET = 0x10000;
export const MULTI_OP_TX = asAddress(numberToHex(TX_TYPE_OFFSET + (1 << 0), { size: 20 }));
export const SCHEDULED_TX = asAddress(numberToHex(TX_TYPE_OFFSET + (1 << 1), { size: 20 }));
