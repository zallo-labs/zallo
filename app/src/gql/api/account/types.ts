import { Address, PolicyId, tryAsAddress } from 'lib';
import { WPolicy } from '../policy/types';
import { DateTime } from 'luxon';
import { TransferDirection } from '@api/generated';

export type AccountIdlike = Address | PolicyId;

export const asAccountId = <T extends AccountIdlike | undefined>(id: T) =>
  (typeof id === 'object'
    ? (id.account as Address)
    : (tryAsAddress(id) as Address | undefined)) as T extends undefined
    ? Address | undefined
    : Address;

export interface WAccount {
  id: string;
  address: Address;
  name: string;
  isActive: boolean;
  policies: WPolicy[];
}

export interface Transfer {
  id: string;
  direction: TransferDirection;
  token: Address;
  from: Address;
  to: Address;
  amount: bigint;
  timestamp: DateTime;
}
