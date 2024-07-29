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
import e, { $infer, Set } from '~/edgeql-js';
import { and, Shape } from '~/core/database';
import { PolicyInput, TransfersConfigInput } from './policies.input';
import { selectAccount, selectAccount2 } from '~/feat/accounts/accounts.util';
import { merge } from 'ts-deepmerge';
import { match, P } from 'ts-pattern';
import { getUserCtx } from '~/core/context';
import { $UAddress, $uint16 } from '~/edgeql-js/modules/default';
import { $ } from 'edgedb';

export type UniquePolicy = uuid | { account: UAddress; key: PolicyKey | number };

export const selectPolicy = (id: UniquePolicy) =>
  typeof id === 'string'
    ? e.select(e.Policy, () => ({ filter_single: { id } }))
    : e.assert_single(
        e.select(e.Policy, (p) => ({
          filter: and(
            e.op(p.account, '?=', selectAccount(id.account)),
            e.op(p.key, '=', id.key),
            p.isLatest,
          ),
        })),
      );

export const latestPolicy2 = (
  account: Set<$UAddress, $.Cardinality.One>,
  key: Set<$uint16, $.Cardinality.One>,
) =>
  e.assert_single(
    e.select(e.Policy, (p) => ({
      filter: and(
        e.op(p.account, '?=', selectAccount2(account)),
        e.op(p.key, '=', key),
        p.isLatest,
      ),
    })),
  );

const s_ = (id: uuid) => e.select(e.Policy, () => ({ filter_single: { id } }));
export type SelectedPolicy = ReturnType<typeof s_>;

const selectPolicies = () => e.assert_exists(e.select(e.Policy));
export type SelectedPolicies = ReturnType<typeof selectPolicies>;

export const PolicyShape = {
  key: true,
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
  allowMessages: true,
  delay: true,
} satisfies Shape<typeof e.Policy>;

const s = e.select(e.Policy, () => PolicyShape);
export type PolicyShape = $infer<typeof s>[0] | null;

export const policyStateAsPolicy = <S extends PolicyShape>(state: S) =>
  (state
    ? asPolicy({
        key: state.key,
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
          otherMessage: { allow: state.allowMessages },
          delay: state.delay,
        },
      })
    : null) as S extends null ? Policy | null : Policy;

export const inputAsPolicyState = (
  key: PolicyKey,
  p: Partial<PolicyInput>,
  defaults: NonNullable<PolicyShape> = {
    key: 0,
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
    allowMessages: false,
    delay: 0,
  },
): NonNullable<PolicyShape> => {
  const approvers = p.approvers?.map((a) => ({ address: a })) ?? defaults.approvers;

  return {
    ...defaults,
    key,
    approvers,
    threshold: Math.min(p.threshold ?? p.approvers?.length ?? defaults.threshold, approvers.length),
    ...(p.approvers && { approvers: p.approvers.map((a) => ({ address: a })) }),
    ...(p.actions?.length && {
      actions: p.actions as unknown as NonNullable<PolicyShape>['actions'],
    }),
    ...(p.transfers && {
      transfers: {
        ...p.transfers,
        budget: p.transfers.budget ?? key,
      },
    }),
    allowMessages: p.allowMessages ?? defaults.allowMessages,
    delay: p.delay ?? defaults.delay,
  };
};

export const inputAsPolicy = (key: PolicyKey, p: PolicyInput) =>
  policyStateAsPolicy(inputAsPolicyState(key, p));

export const asTransfersConfig = (c: TransfersConfigInput): TransfersConfig => ({
  defaultAllow: c.defaultAllow,
  budget: c.budget,
  limits: Object.fromEntries(c.limits.map((l) => [l.token, l])),
});
