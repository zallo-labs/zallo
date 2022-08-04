import { AccountRef, Address, createIsObj, Id, Quorum } from 'lib';

export const QUERY_ACCOUNTS_POLL_INTERVAL = 30 * 1000;

export interface CombinedQuorum {
  approvers: Quorum;
  active?: boolean;
}

export const isCombinedQuorum = createIsObj<CombinedQuorum>('approvers');

export interface AccountId {
  safeAddr: Address;
  ref: AccountRef;
}

export interface CombinedAccount extends AccountId {
  id: Id;
  name: string;
  quorums: CombinedQuorum[];
  active?: boolean;
}
