import { Account, Address, Id } from 'lib';
import { WalletId } from '../wallets';

export const QUERY_ACCOUNT_POLL_INTERVAL = 30 * 1000;

export interface CombinedAccount {
  id: Id;
  addr: Address;
  contract: Account;
  impl: Address;
  deploySalt?: string;
  name: string;
  walletIds: WalletId[];
}
