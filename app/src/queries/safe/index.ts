import { Safe, Address, Id } from 'lib';

export const QUERY_SAFE_POLL_INTERVAL = 30 * 1000;

export interface CombinedSafe {
  id: Id;
  contract: Safe;
  impl: Address;
  deploySalt?: string;
  name?: string;
}
