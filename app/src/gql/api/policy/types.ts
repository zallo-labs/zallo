import { AccountId } from '@api/account';
import { PolicyRulesFieldsFragment } from '@api/generated';
import {
  PolicyKey,
  Policy,
  ApprovalsRule,
  asAddress,
  asSelector,
  FunctionsRule,
  isTruthy,
  TargetsRule,
} from 'lib';

export type WPolicy = {
  account: AccountId;
  key: PolicyKey;
  name: string;
} & (
  | {
      active: Policy;
      draft?: Policy | null;
    }
  | {
      active?: Policy;
      draft: Policy;
    }
);

export const convertPolicyFragment = (
  key: PolicyKey,
  r: PolicyRulesFieldsFragment | null | undefined,
): Policy | undefined => {
  if (!r) return undefined;

  return new Policy(
    key,
    ...[
      r.approvers &&
        r.approvers?.length > 0 &&
        new ApprovalsRule(r.approvers.map((a) => asAddress(a.userId))),
      r.onlyFunctions &&
        r.onlyFunctions.length > 0 &&
        new FunctionsRule(r.onlyFunctions.map(asSelector)),
      r.onlyTargets && r.onlyTargets.length > 0 && new TargetsRule(r.onlyTargets.map(asAddress)),
    ].filter(isTruthy),
  );
};
