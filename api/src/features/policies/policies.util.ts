import { asPolicy, asTargets, Policy, PolicyKey } from 'lib';
import { PolicyInput } from './policies.input';

export const inputAsPolicy = (key: PolicyKey, p: PolicyInput): Policy =>
  asPolicy({
    key,
    approvers: p.approvers,
    threshold: p.threshold,
    permissions: {
      targets: asTargets(p.permissions.targets),
    },
  });
