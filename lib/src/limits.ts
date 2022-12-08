import { BigNumber } from 'ethers';
import { Address } from './addr';

export interface SpendingConfig {
  allowlisted?: boolean;
  limits?: Record<Address, TokenLimit>;
}

export interface TokenLimit {
  token: Address;
  amount: BigNumber;
  period: TokenLimitPeriod;
}

export enum TokenLimitPeriod {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
}
