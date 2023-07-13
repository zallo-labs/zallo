import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ACCOUNT_INTERFACE, Address, asHex, asPolicyKey, Policy, POLICY_ABI } from 'lib';
import { ProposalsService, selectTransactionProposal } from '../proposals/proposals.service';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.input';
import _ from 'lodash';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import {
  UniquePolicy,
  uniquePolicy,
  inputAsPolicy,
  policyStateShape,
  policyStateAsPolicy,
  asTransfersConfig,
  asTargetsConfig,
} from './policies.util';

interface CreateParams extends CreatePolicyInput {
  accountId?: uuid;
  skipProposal?: boolean;
}

@Injectable()
export class PoliciesService {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    private userAccounts: AccountsCacheService,
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

    return await this.db.transaction(async (db) => {
      const key = keyArg ?? (await this.getFreeKey(accountId));
      const policy = inputAsPolicy(key, policyInput);

      await this.upsertApprovers(accountId, policy);

      const proposal = !skipProposal ? await this.proposeState(account, policy) : undefined;

      const { id } = await e
        .insert(e.Policy, {
          account: selectAccount,
          key,
          name: name || `Policy ${key}`,
          stateHistory: e.insert(e.PolicyState, {
            proposal,
            ...this.insertStateShape(policy),
          }),
        })
        .run(db);

      return { id, key };
    });
  }

  private insertStateShape(policy: Policy) {
    const targets = policy.permissions.targets;
    const targetContracts = Object.entries(targets.contracts).map(([contract, target]) =>
      e.insert(e.ContractTarget, {
        contract,
        functions: Object.entries(target.functions).map(([selector, allow]) => ({
          selector,
          allow,
        })),
        defaultAllow: target.defaultAllow,
      }),
    );

    const transfers = policy.permissions.transfers;
    const transferLimits = Object.entries(transfers.limits).map(([token, limit]) =>
      e.insert(e.TransferLimit, {
        token,
        amount: limit.amount,
        duration: limit.duration,
      }),
    );

    return {
      approvers: e.for(e.cast(e.str, e.set(...policy.approvers)), (approver) =>
        e.insert(e.Approver, { address: e.cast(e.str, approver) }).unlessConflict((approver) => ({
          on: approver.address,
          else: approver,
        })),
      ),
      threshold: policy.threshold,
      targets: e.insert(e.TargetsConfig, {
        ...(targetContracts.length && { contracts: e.set(...targetContracts) }),
        default: e.insert(e.Target, {
          functions: Object.entries(targets.default.functions).map(([selector, allow]) => ({
            selector,
            allow,
          })),
          defaultAllow: targets.default.defaultAllow,
        }),
      }),
      transfers: e.insert(e.TransfersConfig, {
        defaultAllow: transfers.defaultAllow,
        budget: transfers.budget ?? policy.key,
        ...(transferLimits.length && { limits: e.set(...transferLimits) }),
      }),
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
          .run(db);
        if (!p) throw new UserInputError("Policy doesn't exist");
      }

      // State
      if (approvers || threshold !== undefined || permissions) {
        // Get existing policy state
        // If approvers, threshold, or permissions are undefined then modify the policy accordingly
        // Propose new state
        const existing = await e
          .select(e.Policy, (p) => ({
            filter_single: {
              account: e.select(p.account, () => ({ filter_single: { address: account } })),
              key,
            },
            account: { id: true },
            state: policyStateShape,
            draft: policyStateShape,
          }))
          .run(db);
        return;
        //   if (!existing) throw new UserInputError("Policy doesn't exist");

        //   const policy = policyStateAsPolicy(key, existing?.draft ?? existing?.state!);

        //   if (approvers) policy.approvers = new Set(approvers);
        //   if (threshold !== undefined) policy.threshold = threshold;
        //   if (permissions?.targets) policy.permissions.targets = asTargetsConfig(permissions.targets);
        //   if (permissions?.transfers)
        //     policy.permissions.transfers = asTransfersConfig(permissions.transfers);

        //   // await this.upsertApprovers(existing.account.id, policy);

        //   const proposal = await this.proposeState(account, policy);

        //   await e
        //     .update(e.Policy, (p) => ({
        //       ...uniquePolicy({ account, key })(p),
        //       set: {
        //         stateHistory: {
        //           '+=': e.insert(e.PolicyState, {
        //             proposal,
        //             ...this.insertStateShape(policy),
        //           }),
        //         },
        //       },
        //     }))
        //     .run(db);
      }
    });
  }

  async remove({ account, key }: UniquePolicyInput) {
    await this.db.transaction(async (db) => {
      const selectAccount = e.select(e.Account, () => ({ filter_single: { address: account } }));

      const isActive =
        (
          await e
            .select(e.Policy, () => ({
              isActive: true,
              filter_single: { account: selectAccount, key },
            }))
            .run(db)
        )?.isActive ?? false;

      const proposal =
        isActive &&
        (await (async () => {
          const proposal = await this.proposals.propose({
            account,
            operations: [
              {
                to: account,
                data: asHex(ACCOUNT_INTERFACE.encodeFunctionData('removePolicy', [key])),
              },
            ],
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
                targets: e.insert(e.TargetsConfig, {
                  default: e.insert(e.Target, { functions: [], defaultAllow: true }),
                }),
                transfers: e.insert(e.TransfersConfig, { budget: key }),
              }),
            },
          },
        }))
        .run(db);
      if (!r) throw new UserInputError("Policy doesn't exist");
    });
  }

  private async proposeState(account: Address, policy: Policy) {
    const proposal = await this.proposals.propose({
      account,
      operations: [
        {
          to: account,
          data: asHex(
            ACCOUNT_INTERFACE.encodeFunctionData('addPolicy', [POLICY_ABI.asStruct(policy)]),
          ),
        },
      ],
    });

    return e.select(e.TransactionProposal, () => ({ filter_single: { id: proposal.id } }));
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
  // This prevent loss of account access on an accidental draft
  // TODO: consider intended behaviour
  private async upsertApprovers(account: uuid, policy: Policy) {
    if (!policy.approvers.size) return;

    await Promise.all(
      [...policy.approvers].map((approver) =>
        this.userAccounts.addCachedAccount({ approver, account }),
      ),
    );
  }
}
