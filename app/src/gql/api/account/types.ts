import { Address, PolicyId, tryAsAddress } from 'lib';
import { WPolicy } from '../policy/types';

export type AccountId = Address & { isAccountId: true };
export type AccountIdlike = AccountId | PolicyId | string;

export const asAccountId = <T extends AccountIdlike | undefined>(id: T) =>
  (typeof id === 'object'
    ? (id.account as AccountId)
    : (tryAsAddress(id) as AccountId | undefined)) as T extends undefined
    ? AccountId | undefined
    : AccountId;

export interface WAccount {
  id: AccountId;
  name: string;
  isActive: boolean;
  policies: WPolicy[];
}
