import { AccountRef, Address, Id, Quorums } from 'lib';

export const QUERY_ACCOUNTS_POLL_INTERVAL = 30 * 1000;

export interface CombinedAccount {
  id: Id;
  safeAddr: Address;
  ref: AccountRef;
  name?: string;
  quorums: Quorums;
}
