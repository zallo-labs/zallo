import {
  Address,
  ALLOW_ALL_TARGETS,
  ALLOW_ALL_TRANSFERS_CONFIG,
  asPolicy,
  Policy,
  PolicyKey,
  Selector,
  TargetsConfig,
  TransfersConfig,
} from 'lib';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e, { $infer } from '~/edgeql-js';
import { Shape, ShapeFunc } from '../database/database.select';
import { PolicyInput, TargetsConfigInput, TransfersConfigInput } from './policies.input';

export type UniquePolicy = { id: uuid } | { account: Address; key: PolicyKey };

export const uniquePolicy = (unique: UniquePolicy) =>
  e.shape(e.Policy, () => ({
    filter_single:
      'id' in unique
        ? { id: e.uuid(unique.id) }
        : {
            account: e.select(e.Account, () => ({ filter_single: { address: unique.account } })),
            key: unique.key,
          },
  }));

export const selectPolicy = (id: UniquePolicy, shape?: ShapeFunc<typeof e.Policy>) =>
  e.select(e.Policy, (p) => ({
    ...shape?.(p),
    ...uniquePolicy(id)(p),
  }));

export const policyStateShape = {
  approvers: { address: true },
  threshold: true,
  targets: {
    contracts: {
      contract: true,
      functions: true,
      defaultAllow: true,
    },
    default: {
      functions: true,
      defaultAllow: true,
    },
  },
  transfers: {
    limits: {
      token: true,
      amount: true,
      duration: true,
    },
    defaultAllow: true,
    budget: true,
  },
} satisfies Shape<typeof e.PolicyState>;

const s = e.select(e.PolicyState, () => policyStateShape);
export type PolicyStateShape = $infer<typeof s>[0] | null;

export const policyStateAsPolicy = <S extends PolicyStateShape>(key: number, state: S) =>
  (state
    ? asPolicy({
        key,
        approvers: new Set(state.approvers.map((a) => a.address as Address)),
        threshold: state.threshold,
        permissions: {
          targets: asTargetsConfig({
            contracts: state.targets.contracts.map((t) => ({
              ...t,
              functions: t.functions.map((s) => ({ ...s, selector: s.selector as Selector })),
              contract: t.contract as Address,
            })),
            default: {
              functions: state.targets.default.functions.map((s) => ({
                ...s,
                selector: s.selector as Selector,
              })),
              defaultAllow: state.targets.default.defaultAllow,
            },
          }),
          transfers: asTransfersConfig({
            ...state.transfers,
            limits: state.transfers.limits.map((l) => ({ ...l, token: l.token as Address })),
          }),
        },
      })
    : null) as S extends null ? Policy | null : Policy;

export const inputAsPolicy = (key: PolicyKey, p: PolicyInput): Policy =>
  asPolicy({
    key,
    approvers: p.approvers,
    threshold: p.threshold,
    permissions: {
      targets: p.permissions.targets ? asTargetsConfig(p.permissions.targets) : ALLOW_ALL_TARGETS,
      transfers: p.permissions.transfers
        ? asTransfersConfig(p.permissions.transfers)
        : ALLOW_ALL_TRANSFERS_CONFIG,
    },
  });

export const asTargetsConfig = (c: TargetsConfigInput): TargetsConfig => ({
  contracts: Object.fromEntries(
    c.contracts.map((t) => [
      t.contract,
      {
        functions: Object.fromEntries(t.functions.map((s) => [s.selector, s.allow])),
        defaultAllow: t.defaultAllow,
      },
    ]),
  ),
  default: {
    functions: Object.fromEntries(c.default.functions.map((s) => [s.selector, s.allow])),
    defaultAllow: c.default.defaultAllow,
  },
});

export const asTransfersConfig = (c: TransfersConfigInput): TransfersConfig => ({
  defaultAllow: c.defaultAllow,
  budget: c.budget,
  limits: Object.fromEntries(c.limits.map((l) => [l.token, l])),
});
