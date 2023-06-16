import { PolicyStateFieldsFragment } from '@api/generated';
import { PolicyKey, Policy, asAddress, asSelector, asPolicy, Address, Hex } from 'lib';

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
          '*': new Set([]),
          ...Object.fromEntries(
            (s.targets ?? []).map((t) => [
              t.to === '*' ? '*' : asAddress(t.to),
              new Set(t.selectors?.map((s) => (s === '*' ? '*' : asSelector(s)))),
            ]),
          ),
        },
      },
    }),
    proposal: s.proposal?.hash,
  };
};
