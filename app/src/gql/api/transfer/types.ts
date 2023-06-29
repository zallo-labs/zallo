import { Address, BigIntlike } from 'lib';
import { DateTime } from 'luxon';
import { TransferDirection } from '@api/generated';

export interface Transfer {
  id: string;
  direction: TransferDirection;
  token: Address;
  from: Address;
  to: Address;
  amount: BigIntlike;
  timestamp: DateTime | string;
}
