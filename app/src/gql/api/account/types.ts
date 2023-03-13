import { Address, Policy, PolicyGuid, PolicyKey, tryAsAddress } from 'lib';
import { O } from 'ts-toolbelt';

export type AccountId = Address & { isAccountId: true };
export type AccountIdlike = AccountId | PolicyGuid | string;

export const asAccountId = <T extends AccountIdlike | undefined>(id: T) =>
  (typeof id === 'object'
    ? (id.account as AccountId)
    : (tryAsAddress(id) as AccountId | undefined)) as T extends undefined
    ? AccountId | undefined
    : AccountId;

export type WPolicy = {
  account: AccountId;
  key: PolicyKey;
  name: string;
} & O.AtLeast<{
  active: Removable<Policy>;
  draft: Removable<Policy>;
}>;

export interface WAccount {
  id: AccountId;
  name: string;
  isActive: boolean;
  policies: WPolicy[];
}

export const REMOVAL = Symbol();
export const isRemoval = (value: unknown): value is typeof REMOVAL => value === REMOVAL;
export type Removable<T> = T | typeof REMOVAL;
