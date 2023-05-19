import { Address, PolicyId, tryAsAddress } from 'lib';
import { WPolicy } from '../policy/types';

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
