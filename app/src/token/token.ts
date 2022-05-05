import { Erc20 } from './erc20';

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  addr: string; // Current chain address
  addresses: Partial<Record<'mainnet' | 'testnet', string>>;
  iconUri: string;
  contract: Erc20;
}
