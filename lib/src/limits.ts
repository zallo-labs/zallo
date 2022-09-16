import { BigNumber } from 'ethers';
import { Address } from './addr';

export interface LimitsConfig {
  spendingAllowlisted: boolean;
  limits: Record<Address, Limit>;
}

export interface Limit {
  token: Address;
  amount: BigNumber;
  period: LimitPeriod;
}

export enum LimitPeriod {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week',
}
