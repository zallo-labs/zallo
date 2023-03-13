import { PolicyRules, Approver } from '@prisma/client';
import {
  ApprovalsRule,
  asAddress,
  asSelector,
  FunctionsRule,
  isPresent,
  Policy,
  TargetsRule,
} from 'lib';

export type PrismaPolicy = Pick<PolicyRules, 'policyKey' | 'onlyFunctions' | 'onlyTargets'> & {
  approvers: Pick<Approver, 'userId'>[];
};

export const prismaAsPolicy = (p: PrismaPolicy): Policy =>
  new Policy(
    p.policyKey,
    ...[
      p.approvers?.length ? new ApprovalsRule(p.approvers.map((a) => asAddress(a.userId))) : null,
      p.onlyFunctions?.length ? new FunctionsRule(p.onlyFunctions.map(asSelector)) : null,
      p.onlyTargets?.length ? new TargetsRule(p.onlyTargets.map(asAddress)) : null,
    ].filter(isPresent),
  );
