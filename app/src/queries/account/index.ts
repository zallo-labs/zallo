import { Account, Address, Id } from 'lib';

export const QUERY_ACCOUNT_POLL_INTERVAL = 30 * 1000;

export interface CombinedAccount {
  id: Id;
  contract: Account;
  impl: Address;
  deploySalt?: string;
  name: string;
}
