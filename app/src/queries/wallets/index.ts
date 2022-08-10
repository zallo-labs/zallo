import { WalletRef, Address, createIsObj, Id, Quorum } from 'lib';

export const QUERY_WALLETS_POLL_INTERVAL = 30 * 1000;

export interface CombinedQuorum {
  approvers: Quorum;
  active?: boolean;
}

export const isCombinedQuorum = createIsObj<CombinedQuorum>('approvers');

export interface WalletId {
  id: Id;
  accountAddr: Address;
  ref: WalletRef;
}

export interface CombinedWallet extends WalletId {
  name: string;
  quorums: CombinedQuorum[];
  active?: boolean;
}
