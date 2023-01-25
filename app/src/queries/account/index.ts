import { Account, Address } from 'lib';
import { CombinedQuorum } from '../quroum';

export interface CombinedAccount {
  addr: Address;
  contract: Account;
  name: string;
  active?: boolean;
  quorums: CombinedQuorum[];
}
