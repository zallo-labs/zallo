import { BigNumber } from 'ethers';
import { ChainName, Safe } from 'lib';

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  addr: string; // Current chain address
  addresses: Record<ChainName, string>;
  iconUri: string;
  getBalance: (safe: Safe) => Promise<BigNumber>;
}
