import { BigNumber } from 'ethers';
import { Address } from './addr';

export interface Spending {
  limits: Record<Address, TokenLimit>;
  fallback: SpendingFallback;
}

export const DEFAULT_SPENDING: Spending = {
  limits: {},
  fallback: 'allow',
};

export type SpendingFallback = 'allow' | 'deny';

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
