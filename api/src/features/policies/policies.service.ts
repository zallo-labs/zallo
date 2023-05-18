import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_INTERFACE,
  Address,
  asHex,
  asPolicy,
  asPolicyKey,
  asTargets,
  Policy,
  PolicyKey,
  POLICY_ABI,
} from 'lib';
import { ProposalsService, selectTransactionProposal } from '../proposals/proposals.service';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.input';
import { inputAsPolicy } from './policies.util';
import _ from 'lodash';
import { UserInputError } from 'apollo-server-core';
import { UserAccountsService } from '../auth/userAccounts.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';

interface CreateParams extends CreatePolicyInput {
  accountId?: uuid;
  skipProposal?: boolean;
}

export const policyStateShape = e.shape(e.PolicyState, () => ({
  approvers: { address: true },
  threshold: true,
  targets: {
    to: true,
    selectors: true,
  },
}));

export const policyStateAsPolicy = <
  S extends {
    threshold: number;
    approvers: {
      address: string;
    }[];
    targets: {
      to: string;
      selectors: string[];
    }[];
  } | null,
>(
  key: number,
  state: S,
) =>
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

@Injectable()
export class PoliciesService {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    private userAccounts: UserAccountsService,
  ) {}

  async selectUnique(unique: UniquePolicy, shape?: ShapeFunc<typeof e.Policy>) {
    return e
      .select(e.Policy, (p) => ({
        ...(shape && shape(p)),
        ...uniquePolicy(unique)(p),
      }))
      .run(this.db.client);
  }

  async select(shape: ShapeFunc<typeof e.Policy>) {
    return e.select(e.Policy, shape).run(this.db.client);
  }

  async create({
    account,
    accountId: accountIdArg,
    name,
    key: keyArg,
    skipProposal,
    ...policyInput
  }: CreateParams) {
    const selectAccount = e.select(e.Account, () => ({ filter_single: { address: account } }));
    const accountId = accountIdArg ?? (await this.db.query(selectAccount.id));
    if (!accountId) throw new UserInputError('Account not found');

    const key = keyArg ?? (await this.getFreeKey(accountId));
    const policy = inputAsPolicy(asPolicyKey(key), policyInput);

    await this.upsertApprovers(accountId, policy);

    const proposal = !skipProposal && (await this.proposeState(account, policy));

    const { id } = await e
      .insert(e.Policy, {
        account: selectAccount,
        key,
        name: name || `Policy ${key}`,
        stateHistory: e.insert(e.PolicyState, {
          ...(proposal && { proposal }),
          ...this.insertStateShape(policy),
        }),
      })
      .run(this.db.client);

    return { id, key };
  }

  private insertStateShape(policy: Policy) {
    const targets = e.for(
      e.set(
        ...Object.entries(policy.permissions.targets).map(([to, selectors]) =>
          e.json({ to, selectors: [...selectors] }),
        ),
      ),
      (item) =>
        e.insert(e.Target, {
          to: e.cast(e.str, item.to),
          selectors: e.cast(e.array(e.str), item.selectors),
        }),
    );

    return {
      approvers: e.for(e.cast(e.str, e.set(...policy.approvers)), (approver) =>
        e.insert(e.User, { address: e.cast(e.str, approver) }).unlessConflict((user) => ({
          on: user.address,
          else: user,
        })),
      ),
      threshold: policy.threshold,
      targets,
    } satisfies Partial<Parameters<typeof e.insert<typeof e.PolicyState>>[1]>;
  }

  async update({ account, key, name, approvers, threshold, permissions }: UpdatePolicyInput) {
    await this.db.transaction(async (db) => {
      // Metadata
      if (name !== undefined) {
        const p = await e
          .update(e.Policy, (p) => ({
            ...uniquePolicy({ account, key })(p),
            set: { name },
          }))
          .run(this.db.client);
        if (!p) throw new UserInputError("Policy doesn't exist");
      }

      // State
      if (approvers || threshold !== undefined || permissions) {
        // Get existing policy state
        // If approvers, threshold, or permissions are undefined then modify the policy accordingly
        // Propose new state
        const existing = await e
          .select(e.Policy, (p) => ({
            ...uniquePolicy({ account, key })(p),
            state: policyStateShape,
            draft: policyStateShape,
          }))
          .run(db);
        if (!existing) throw new UserInputError("Policy doesn't exist");

        const policy = policyStateAsPolicy(key, existing?.draft ?? existing?.state!);

        if (approvers) policy.approvers = new Set(approvers);
        if (threshold !== undefined) policy.threshold = threshold;
        if (permissions?.targets) policy.permissions = { targets: asTargets(permissions.targets) };

        const accountId = await e
          .select(e.Account, () => ({ filter_single: { address: account } }))
          .id.run(this.db.client);
        if (!accountId) throw new UserInputError('Account not found');
        await this.upsertApprovers(accountId, policy);

        const proposal = await this.proposeState(account, policy);

        await e
          .update(e.Policy, (p) => ({
            ...uniquePolicy({ account, key })(p),
            set: {
              stateHistory: {
                '+=': e.insert(e.PolicyState, {
                  proposal,
                  ...this.insertStateShape(policy),
                }),
              },
            },
          }))
          .run(db);
      }
    });
  }

  async remove({ account, key }: UniquePolicyInput) {
    const selectAccount = e.select(e.Account, () => ({ filter_single: { address: account } }));

    const isActive =
      (
        await e
          .select(e.Policy, () => ({
            isActive: true,
            filter_single: { account: selectAccount, key },
          }))
          .run(this.db.client)
      )?.isActive ?? false;

    const proposal =
      isActive &&
      (await (async () => {
        const proposal = await this.proposals.propose({
          account,
          to: account,
          data: asHex(ACCOUNT_INTERFACE.encodeFunctionData('removePolicy', [key])),
        });

        return selectTransactionProposal(proposal.id);
      })());

    const r = await e
      .update(e.Policy, () => ({
        filter_single: { account: selectAccount, key },
        set: {
          stateHistory: {
            '+=': e.insert(e.PolicyState, {
              ...(proposal && { proposal }),
              isRemoved: true,
              threshold: 0,
            }),
          },
        },
      }))
      .run(this.db.client);
    if (!r) throw new UserInputError("Policy doesn't exist");
  }

  private async proposeState(account: Address, policy: Policy) {
    const proposal = await this.proposals.propose({
      account,
      to: account,
      data: asHex(ACCOUNT_INTERFACE.encodeFunctionData('addPolicy', [POLICY_ABI.asStruct(policy)])),
    });

    return e.select(e.TransactionProposal, () => ({
      filter_single: { id: proposal.id },
    }));
  }

  private async getFreeKey(account: uuid) {
    const acc = await e
      .select(e.Account, () => ({
        policies: {
          key: true,
        },
        filter_single: { id: account },
      }))
      .run(this.db.client);

    return asPolicyKey(acc ? acc.policies.reduce((max, { key }) => Math.max(max, key), 0) + 1 : 0);
  }

  // Note. approvers aren't removed when a draft is replaced they were previously an approver of
  // These users will have account access until the cache expires.
  // This prevent loss of account access on an accidental draft be should be considered more thoroughly
  private async upsertApprovers(account: uuid, policy: Policy) {
    if (!policy.approvers.size) return;

    await Promise.all(
      [...policy.approvers].map((user) => this.userAccounts.add({ user, account })),
    );
  }
}
