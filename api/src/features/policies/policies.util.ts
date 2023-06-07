import { Address, asPolicy, asTargets, Policy, PolicyKey } from 'lib';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e, { $infer } from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { PolicyInput } from './policies.input';

export type UniquePolicy = { id: uuid } | { account: Address; key: PolicyKey };

export const uniquePolicy = (unique: UniquePolicy) =>
  e.shape(e.Policy, (p) => ({
    filter_single:
      'id' in unique
        ? { id: unique.id }
        : {
            account: e.select(p.account, () => ({ filter_single: { address: unique.account } })),
            key: unique.key,
          },
  }));

export const selectPolicy = (id: UniquePolicy, shape?: ShapeFunc<typeof e.Policy>) =>
  e.select(e.Policy, (p) => ({
    ...shape?.(p),
    ...uniquePolicy(id)(p),
  }));

export const policyStateShape = e.shape(e.PolicyState, () => ({
  approvers: { address: true },
  threshold: true,
  targets: {
    to: true,
    selectors: true,
  },
}));

const s = e.select(e.PolicyState, policyStateShape);
export type PolicyStateShape = $infer<typeof s>[0] | null;

export const policyStateAsPolicy = <S extends PolicyStateShape>(key: number, state: S) =>
  (state
    ? asPolicy({
        key,
        approvers: new Set(state.approvers.map((a) => a.address as Address)),
        threshold: state.threshold,
        permissions: {
          targets: asTargets(state.targets),
        },
      })
    : null) as S extends null ? Policy | null : Policy;

export const inputAsPolicy = (key: PolicyKey, p: PolicyInput): Policy =>
  asPolicy({
    key,
    approvers: p.approvers,
    threshold: p.threshold,
    permissions: {
      targets: asTargets(p.permissions.targets),
    },
  });
