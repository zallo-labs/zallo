import { PolicyStateFieldsFragment } from '@api/generated';
import { PolicyKey, Policy, asPolicy, Address, Hex } from 'lib';

export interface PolicyState extends Policy {
  proposal?: Hex;
}

export type WPolicy = {
  account: Address;
  key: PolicyKey;
  name: string;
  status: 'active' | 'add' | 'edit' | 'remove';
} & (
  | {
      state: PolicyState;
      draft?: PolicyState | null;
    }
  | {
      state?: PolicyState;
      draft: PolicyState;
    }
);

export const convertPolicyFragment = (
  key: PolicyKey,
  s: PolicyStateFieldsFragment | null | undefined,
): PolicyState | undefined => {
  if (!s) return undefined;

  return {
    ...asPolicy({
      key,
      approvers: s.approvers?.map((a) => a.address) ?? [],
      threshold: s.threshold,
      permissions: {
        targets: {
          contracts: Object.fromEntries(
            s.targets.contracts.map((c) => [
              c.contract,
              {
                functions: Object.fromEntries(c.functions.map((f) => [f.selector, f.allow])),
                defaultAllow: c.defaultAllow,
              },
            ]),
          ),
          default: {
            functions: Object.fromEntries(
              s.targets.default.functions.map((f) => [f.selector, f.allow]),
            ),
            defaultAllow: s.targets.default.defaultAllow,
          },
        },
      },
    }),
    proposal: s.proposal?.hash,
  };
};
