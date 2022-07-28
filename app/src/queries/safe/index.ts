import { Address, Approver, Id, Safe } from 'lib';

export const QUERY_SAFES_POLL_INTERVAL = 30 * 1000;

export interface CombinedGroup {
  id: Id;
  ref: string;
  active: boolean;
  approvers: Approver[];
  name: string;
}

export interface CombinedSafe {
  safe: Safe;
  name: string;
  deploySalt?: string;
  impl: Address;
  groups: CombinedGroup[];
}

export interface CombinedSafe2 {
  safe: Safe;
  name: string;
  deploySalt?: string;
  impl: Address;
}

export interface CombinedAccount {
  id: Id;
  ref: string;
  active: boolean;
  approvers: Approver[];
  name: string;
  safe: CombinedSafe2;
}
