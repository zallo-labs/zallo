import { BigNumber, Safe } from '@ethers';

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  addr?: string;
  iconUri: string;
  getBalance: (safe: Safe) => Promise<BigNumber>;
}
