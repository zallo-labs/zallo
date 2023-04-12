import { AccountId } from '@api/account';
import { PolicyStateFieldsFragment } from '@api/generated';
import { ProposalId, asProposalId } from '@api/proposal/types';
import { PolicyKey, Policy, asAddress, asSelector, asPolicy } from 'lib';

export interface PolicyState extends Policy {
  proposal?: ProposalId;
}

export type WPolicy = {
  account: AccountId;
  key: PolicyKey;
  name: string;
  state: 'active' | 'add' | 'edit' | 'remove';
} & (
  | {
      active: PolicyState;
      draft?: PolicyState | null;
    }
  | {
      active?: PolicyState;
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
      approvers: s.approvers?.map((a) => asAddress(a.userId)) ?? [],
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
    proposal: s.proposalId ? asProposalId(s.proposalId) : undefined,
  };
};
