import {
  asAddress,
  asPolicy,
  Policy,
  PolicyKey,
  TargetsConfig,
  TransfersConfig,
  UAddress,
} from 'lib';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e, { $infer } from '~/edgeql-js';
import { Shape } from '../database/database.select';
import { PolicyInput, TransfersConfigInput } from './policies.input';
import { selectAccount } from '~/features/accounts/accounts.util';
import merge from 'ts-deepmerge';
import { match, P } from 'ts-pattern';
import { getUserCtx } from '~/request/ctx';

export type UniquePolicy = { id: uuid } | { account: UAddress; key: PolicyKey };

export const uniquePolicy = (unique: UniquePolicy) =>
  e.shape(e.Policy, () => ({
    filter_single:
      'id' in unique
        ? { id: e.uuid(unique.id) }
        : { account: selectAccount(unique.account), key: unique.key },
  }));

export const selectPolicy = (id: UniquePolicy) => e.select(e.Policy, uniquePolicy(id));

export const policyStateShape = {
  approvers: { address: true },
  threshold: true,
  actions: {
    label: true,
    functions: {
      contract: true,
      selector: true,
      abi: true,
    },
    allow: true,
    description: true,
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
        approvers: new Set(state.approvers.map((a) => asAddress(a.address))),
        threshold: state.threshold,
        permissions: {
          targets: merge(
            {
              default: { defaultAllow: false, functions: {} },
              contracts: {},
            } satisfies Partial<TargetsConfig>,
            ...state.actions.flatMap((a) =>
              a.functions.map(
                (f) =>
                  match({ contract: f.contract, selector: f.selector, allow: a.allow })
                    .returnType<Partial<TargetsConfig>>()
                    .with({ contract: P.string, selector: P.string }, (v) => ({
                      contracts: {
                        [v.contract]: {
                          functions: { [v.selector]: v.allow },
                        },
                      },
                    }))
                    .with({ contract: P.string, selector: P.nullish }, (v) => ({
                      contracts: {
                        [v.contract]: {
                          functions: {},
                          defaultAllow: v.allow,
                        },
                      },
                    }))
                    .with({ contract: P.nullish, selector: P.string }, (v) => ({
                      default: {
                        functions: { [v.selector]: v.allow },
                      },
                    }))
                    .with({ contract: P.nullish, selector: P.nullish }, (v) => ({
                      default: {
                        functions: {},
                        defaultAllow: v.allow,
                      },
                    }))
                    .exhaustive() as TargetsConfig,
              ),
            ),
          ),
          transfers: asTransfersConfig({
            ...state.transfers,
            limits: state.transfers.limits.map((l) => ({ ...l, token: asAddress(l.token) })),
          }),
        },
      })
    : null) as S extends null ? Policy | null : Policy;

export const policyInputAsStateShape = (
  key: PolicyKey,
  p: Partial<PolicyInput>,
  defaults: NonNullable<PolicyStateShape> = {
    approvers: [{ address: getUserCtx().approver }],
    threshold: p.approvers ? p.approvers.length : 1,
    actions: [
      {
        label: 'Anything else',
        functions: [{ contract: null, selector: null, abi: null }],
        allow: false,
        description: null,
      },
    ],
    transfers: { limits: [], defaultAllow: false, budget: key },
  },
): NonNullable<PolicyStateShape> => ({
  ...defaults,
  threshold: p.threshold ?? p.approvers?.length ?? defaults.approvers.length,
  ...(p.approvers && { approvers: p.approvers.map((a) => ({ address: a })) }),
  ...(p.threshold !== undefined && { threshold: p.threshold }),
  ...(p.actions?.length && {
    actions: p.actions as unknown as NonNullable<PolicyStateShape>['actions'],
  }),
  ...(p.transfers && {
    transfers: {
      ...p.transfers,
      budget: p.transfers.budget ?? key,
    },
  }),
});

export const inputAsPolicy = (key: PolicyKey, p: PolicyInput) =>
  policyStateAsPolicy(key, policyInputAsStateShape(key, p));

export const asTransfersConfig = (c: TransfersConfigInput): TransfersConfig => ({
  defaultAllow: c.defaultAllow,
  budget: c.budget,
  limits: Object.fromEntries(c.limits.map((l) => [l.token, l])),
});
