import { AccountId } from '@api/account';
import { Address, PolicyKey } from 'lib';
import { Permissions } from 'lib';
import { atom } from 'jotai';

export interface PolicyDraft {
  account: AccountId;
  key?: PolicyKey;
  name: string;
  permissions: Permissions;
  approvers: Set<Address>;
  threshold: number;
}

export const POLICY_DRAFT_ATOM = atom<PolicyDraft>({} as PolicyDraft);
