import { Address, PolicyKey, Selector } from 'lib';
import { Permissions } from 'lib';
import { atom } from 'jotai';
import { PolicyInput } from '@api/generated/graphql';

export interface PolicyDraft {
  account: Address;
  key?: PolicyKey;
  name: string;
  approvers: Set<Address>;
  threshold: number;
  permissions: Permissions;
}

export const POLICY_DRAFT_ATOM = atom<PolicyDraft>({} as PolicyDraft);

export function asPolicyInput(p: PolicyDraft): PolicyInput {
  return {
    key: p.key,
    name: p.name,
    approvers: [...p.approvers],
    threshold: p.threshold,
    permissions: {
      targets: {
        contracts: Object.entries(p.permissions.targets.contracts).map(([contract, target]) => ({
          contract: contract as Address,
          functions: Object.entries(target.functions).map(([selector, allow]) => ({
            selector: selector as Selector,
            allow,
          })),
          defaultAllow: target.defaultAllow,
        })),
        default: {
          functions: Object.entries(p.permissions.targets.default.functions).map(
            ([selector, allow]) => ({
              selector: selector as Selector,
              allow,
            }),
          ),
          defaultAllow: p.permissions.targets.default.defaultAllow,
        },
      },
      transfers: {
        limits: Object.entries(p.permissions.transfers.limits).map(([token, limit]) => ({
          token: token as Address,
          amount: limit.amount,
          duration: limit.duration,
        })),
        budget: p.permissions.transfers.budget,
        defaultAllow: p.permissions.transfers.defaultAllow,
      },
    },
  };
}
