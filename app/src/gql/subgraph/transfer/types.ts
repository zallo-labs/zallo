import { Token } from '@token/token';
import { Address, Id } from 'lib';
import { DateTime } from 'luxon';
import { TransferType } from '@subgraph/generated';

export interface Transfer {
  token: Token;
  from: Address;
  to: Address;
  amount: bigint;
  direction: TransferType;
  timestamp: DateTime;
}

export interface TransferMetadata {
  id: Id;
  timestamp: DateTime;
}
