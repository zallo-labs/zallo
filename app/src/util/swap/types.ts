import { Address } from 'lib';
import { DateTime } from 'luxon';

export interface Pool {
  contract: Address;
  pair: [Address, Address];
  type: 'syncswap-classic' | 'syncswap-stable';
}

export interface TokenAmount {
  token: Address;
  amount: bigint;
}

export interface EstimateSwapParams {
  account: Address;
  pool: Pool;
  from: TokenAmount;
}

export interface GetSwapOperationsParams {
  account: Address;
  pool: Pool;
  from: TokenAmount;
  slippage: number; // percent [0-1]
  deadline: DateTime;
}
