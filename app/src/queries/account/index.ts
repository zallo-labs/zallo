import { Account, Address, DeploySalt, Id } from 'lib';
import { WalletId } from '../wallets';

export const QUERY_ACCOUNT_POLL_INTERVAL = 30 * 1000;

export interface WalletMetadata extends WalletId {
  active?: boolean;
}

export interface AccountMetadata {
  id: Id;
  addr: Address;
  name: string;
}

export interface CombinedAccount extends AccountMetadata {
  contract: Account;
  impl: Address;
  deploySalt?: DeploySalt;
  walletIds: WalletMetadata[];
  active?: boolean;
}
