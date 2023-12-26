import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_ABI,
  asAddress,
  asPolicyKey,
  encodePolicy,
  encodePolicyStruct,
  getMessageSatisfiability,
  getTransactionSatisfiability,
  Policy,
  PolicyKey,
  Satisfiability,
  UAddress,
  UUID,
} from 'lib';
import { TransactionProposalsService } from '../transaction-proposals/transaction-proposals.service';
import {
  CreatePolicyInput,
  PoliciesInput,
  UniquePolicyInput,
  UpdatePolicyInput,
} from './policies.input';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import {
  UniquePolicy,
  uniquePolicy,
  policyStateShape,
  policyStateAsPolicy,
  PolicyStateShape,
  policyInputAsStateShape,
} from './policies.util';
import {
  NameTaken,
  PolicyState,
  SatisfiabilityResult,
  Policy as PolicyModel,
} from './policies.model';
import {
  proposalTxShape,
  transactionProposalAsTx,
  ProposalTxShape,
} from '../transaction-proposals/transaction-proposals.util';
import { and, isExclusivityConstraintViolation } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { err, fromPromise, ok } from 'neverthrow';
import { encodeFunctionData } from 'viem';

export interface CreatePolicyParams extends CreatePolicyInput {
  key?: PolicyKey;
  skipProposal?: boolean;
}

@Injectable()
export class PoliciesService {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => TransactionProposalsService))
    private proposals: TransactionProposalsService,
    private userAccounts: AccountsCacheService,
  ) {}

  async selectUnique(unique: UniquePolicy, shape?: ShapeFunc<typeof e.Policy>) {
    return e
      .assert_single(
        e.select(e.Policy, (p) => ({
          // ...uniquePolicy(unique)(p), // assert single with filter is a workaround for the issue - https://github.com/edgedb/edgedb-js/issues/708
          ...shape?.(p),
          filter:
            'id' in unique
              ? e.op(p.id, '=', e.uuid(unique.id))
              : and(
                  e.op(p.account, '=', selectAccount(unique.account)),
                  e.op(p.key, '=', unique.key),
                ),
        })),
      )
      .run(this.db.client) as unknown as PolicyModel | null;
  }

  async select({ includeDisabled }: PoliciesInput, shape: ShapeFunc<typeof e.Policy>) {
    return e
      .select(e.Policy, (p) => ({
        ...shape?.(p),
        ...(!includeDisabled && { filter: p.isEnabled }),
      }))
      .run(this.db.client);
  }

  async create({ account, name, key: keyArg, skipProposal, ...policyInput }: CreatePolicyParams) {
    const selectedAccount = selectAccount(account);

    const r = this.db.transaction(async (db) => {
      const key =
        keyArg ??
        (await (async () => {
          const maxKey = (await e
            .select(
              e.max(e.select(selectedAccount['<account[is Policy]'], () => ({ key: true })).key),
            )
            .run(db)) as number | null;

          return asPolicyKey(maxKey !== null ? maxKey + 1 : 0);
        })());

      const state = policyInputAsStateShape(key, policyInput);
      const proposal =
        !skipProposal && (await this.getStateProposal(account, policyStateAsPolicy(key, state)));

      // with proposal required - https://github.com/edgedb/edgedb/issues/6305
      const { id } = await e
        .with(
          proposal ? [proposal] : [],
          e.select(
            e.insert(e.Policy, {
              account: selectedAccount,
              key,
              name: name || `Policy ${key}`,
              stateHistory: e.insert(e.PolicyState, {
                ...(proposal && { proposal }),
                ...this.insertStateShape(state),
              }),
            }),
          ),
        )
        .run(db);

      this.db.afterTransaction(() =>
        this.userAccounts.invalidateApproverUserAccountsCache(...policyInput.approvers),
      );

      return { id, key };
    });

    try {
      return ok(await r);
    } catch (e) {
      // May occur due to key or name uniqueness; key however is only accepted internally so it must be by name
      if (isExclusivityConstraintViolation(e))
        return err(new NameTaken('A policy with this name already exists'));
      throw e;
    }
  }

  private insertStateShape(p: NonNullable<PolicyStateShape>) {
    return {
      approvers: e.for(e.cast(e.str, e.set(...p.approvers.map((a) => a.address))), (approver) =>
        e.insert(e.Approver, { address: e.cast(e.str, approver) }).unlessConflict((approver) => ({
          on: approver.address,
          else: approver,
        })),
      ),
      threshold: p.threshold || p.approvers.length,
      actions: e.set(
        ...p.actions.map((a) =>
          e.insert(e.Action, {
            label: a.label,
            functions: e.set(
              ...a.functions.map((f) =>
                e.insert(e.ActionFunction, {
                  contract: f.contract,
                  selector: f.selector,
                }),
              ),
            ),
            allow: a.allow,
            description: a.description,
          }),
        ),
      ),
      transfers: e.insert(e.TransfersConfig, {
        defaultAllow: p.transfers.defaultAllow,
        budget: p.transfers.budget,
        ...(p.transfers.limits.length && {
          limits: e.set(...p.transfers.limits.map((limit) => e.insert(e.TransferLimit, limit))),
        }),
      }),
    } satisfies Partial<Parameters<typeof e.insert<typeof e.PolicyState>>[1]>;
  }

  async update({ account, key, name, ...policyInput }: UpdatePolicyInput) {
    return this.db.transaction(async (db) => {
      // Metadata
      if (name !== undefined) {
        const r = await fromPromise(
          e
            .update(e.Policy, (p) => ({
              ...uniquePolicy({ account, key })(p),
              set: { name },
            }))
            .run(db),
          () => {
            return new NameTaken('Policy name already taken');
          },
        );
        if (r.isErr()) return r;

        if (!r.value) throw new UserInputError("Policy doesn't exist");
      }

      // State
      if (Object.values(policyInput).some((v) => v !== undefined)) {
        // Get existing policy state
        // If approvers, threshold, or permissions are undefined then modify the policy accordingly
        // Propose new state
        const selectedAccount = selectAccount(account);

        const existing = await e
          .select({
            account: selectedAccount,
            policy: e.select(e.Policy, () => ({
              filter_single: { account: selectedAccount, key },
              state: policyStateShape,
              draft: policyStateShape,
            })),
          })
          .run(db);
        if (!existing.account) throw new UserInputError("Account doesn't exist");
        if (!existing.policy) throw new UserInputError("Policy doesn't exist");

        const currentState = existing.policy.draft ?? existing.policy.state!;
        const currentEncoded = encodePolicy(policyStateAsPolicy(key, currentState));

        const newState = policyInputAsStateShape(key, policyInput, currentState);
        const newPolicy = policyStateAsPolicy(key, newState);
        if (currentEncoded === encodePolicy(newPolicy)) return ok(undefined); // Only update if policy would actually change

        const proposal = await this.getStateProposal(account, newPolicy);

        await e
          .with(
            [proposal],
            e.select(
              e.update(e.Policy, (p) => ({
                ...uniquePolicy({ account, key })(p),
                set: {
                  stateHistory: {
                    '+=': e.insert(e.PolicyState, {
                      proposal,
                      ...this.insertStateShape(newState),
                    }),
                  },
                },
              })),
            ),
          )
          .run(db);

        this.db.afterTransaction(() =>
          this.userAccounts.invalidateApproverUserAccountsCache(
            ...newState.approvers.map((a) => asAddress(a.address)),
          ),
        );
      }

      return ok(undefined);
    });
  }

  async remove({ account, key }: UniquePolicyInput) {
    await this.db.transaction(async (db) => {
      const selectedAccount = selectAccount(account);

      const policy = await e
        .select(e.Policy, () => ({
          filter_single: { account: selectedAccount, key },
          isActive: true,
          draft: {
            isRemoved: true,
          },
        }))
        .run(db);
      if (!policy) throw new UserInputError("Policy doesn't exist");

      if (policy.draft?.isRemoved) return; // Don't do anything if removal draft already exists

      const proposal =
        policy.isActive &&
        (await this.proposals.getInsertProposal({
          account,
          operations: [
            {
              to: asAddress(account),
              data: encodeFunctionData({
                abi: ACCOUNT_ABI,
                functionName: 'removePolicy',
                args: [key],
              }),
            },
          ],
        }));

      await e
        .with(
          proposal ? [proposal] : [],
          e.select(
            e.update(e.Policy, () => ({
              filter_single: { account: selectedAccount, key },
              set: {
                stateHistory: {
                  '+=': e.insert(e.PolicyState, {
                    ...(proposal && { proposal }),
                    isRemoved: true,
                    threshold: 0,
                    transfers: e.insert(e.TransfersConfig, { budget: key }),
                  }),
                },
              },
            })),
          ),
        )
        .run(db);
    });
  }

  async satisfiability(
    proposalId: UUID,
    key: number,
    state: PolicyState | null,
  ): Promise<SatisfiabilityResult> {
    if (!state)
      return { result: Satisfiability.unsatisfiable, reasons: [{ reason: 'Policy inactive' }] };

    const proposal = await this.db.query(
      e.select(e.Proposal, (p) => ({
        filter_single: { id: proposalId },
        approvals: { approver: { address: true } },
        ...e.is(e.TransactionProposal, proposalTxShape(p)),
      })),
    );
    if (!proposal)
      return { result: Satisfiability.unsatisfiable, reasons: [{ reason: 'Proposal not found' }] };

    const p = policyStateAsPolicy(key, state);
    const approvals = new Set(proposal.approvals.map((a) => asAddress(a.approver.address)));

    return proposal.operations
      ? getTransactionSatisfiability(
          p,
          transactionProposalAsTx(proposal as ProposalTxShape),
          approvals,
        )
      : getMessageSatisfiability(p, approvals);
  }

  private async getStateProposal(account: UAddress, policy: Policy) {
    return await this.proposals.getInsertProposal({
      account,
      operations: [
        {
          to: asAddress(account),
          data: encodeFunctionData({
            abi: ACCOUNT_ABI,
            functionName: 'addPolicy',
            args: [encodePolicyStruct(policy)],
          }),
        },
      ],
    });
  }
}
