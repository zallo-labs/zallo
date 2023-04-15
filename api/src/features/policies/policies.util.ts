import { Approver, PolicyState, Prisma, Target } from '@prisma/client';
import { asAddress, asPolicy, asTargets, Policy, PolicyKey } from 'lib';
import { PolicyInput } from './policies.args';

export type PrismaPolicy = Pick<PolicyState, 'policyKey' | 'threshold'> & {
  approvers: Pick<Approver, 'userId'>[];
  targets: Pick<Target, 'to' | 'selectors'>[];
};

export const POLICY_STATE_FIELDS = {
  policyKey: true,
  approvers: { select: { userId: true } },
  threshold: true,
  targets: { select: { to: true, selectors: true } },
} satisfies Prisma.PolicyStateSelect;

export const prismaAsPolicy = (p: PrismaPolicy): Policy =>
  asPolicy({
    key: p.policyKey,
    approvers: p.approvers.map((a) => asAddress(a.userId)),
    threshold: p.threshold,
    permissions: {
      targets: asTargets(p.targets),
    },
  });

export const inputAsPolicy = (key: PolicyKey, p: PolicyInput): Policy =>
  asPolicy({
    key,
    approvers: p.approvers,
    threshold: p.threshold,
    permissions: {
      targets: asTargets(p.permissions.targets),
    },
  });
