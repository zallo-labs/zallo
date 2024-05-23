import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_ABI,
  asAddress,
  asPolicyKey,
  encodePolicy,
  encodePolicyStruct,
  validateMessage,
  validateTransaction,
  Policy,
  PolicyKey,
  Address,
  UAddress,
  PLACEHOLDER_ACCOUNT_ADDRESS,
  Tx,
  UUID,
} from 'lib';
import { TransactionsService } from '../transactions/transactions.service';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.input';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import {
  policyStateAsPolicy,
  PolicyShape,
  policyInputAsStateShape,
  selectPolicy,
  latestPolicy2,
} from './policies.util';
import { NameTaken, Policy as PolicyModel, ValidationError } from './policies.model';
import { TX_SHAPE, transactionAsTx, ProposalTxShape } from '../transactions/transactions.util';
import { and, isExclusivityConstraintViolation } from '../database/database.util';
import { selectAccount } from '../accounts/accounts.util';
import { err, ok } from 'neverthrow';
import { encodeFunctionData } from 'viem';
import { $Transaction } from '~/edgeql-js/modules/default';
import { getUserCtx } from '#/util/context';

export interface CreatePolicyParams extends CreatePolicyInput {
  key?: PolicyKey;
  initState?: boolean;
}

@Injectable()
export class PoliciesService {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
    private userAccounts: AccountsCacheService,
  ) {}

  async latest(unique: { account: UAddress; key: number }, shape?: ShapeFunc) {
    return (await this.db.queryWith(
      { account: e.UAddress, key: e.int64 },
      ({ account, key }) => e.select(latestPolicy2(account, key), (p) => ({ ...shape?.(p) })),
      { account: unique.account, key: unique.key },
    )) as unknown as PolicyModel | null;
  }

  async create({ account, name, key: keyArg, initState, ...policyInput }: CreatePolicyParams) {
    const selectedAccount = selectAccount(account);

    const key =
      keyArg ??
      (await (async () => {
        const maxKey = (await this.db.query(
          e.select(
            e.max(e.select(selectedAccount['<account[is Policy]'], () => ({ key: true })).key),
          ),
        )) as number | null;

        return asPolicyKey(maxKey !== null ? maxKey + 1 : 0);
      })());

    const state = policyInputAsStateShape(key, policyInput);
    const proposal =
      !initState && (await this.getStateProposal(account, policyStateAsPolicy(state)));

    try {
      // with proposal required - https://github.com/edgedb/edgedb/issues/6305
      const { id } = await this.db.query(
        e.insert(e.Policy, {
          account: selectedAccount,
          key,
          name: name || `Policy ${key}`,
          ...(proposal && { proposal }),
          ...this.insertStateShape(state, initState ? { account: asAddress(account) } : undefined),
        }),
      );

      this.userAccounts.invalidateApproversCache(...policyInput.approvers);

      return ok({ id, account, key });
    } catch (e) {
      // May occur due to key or name uniqueness; key however is only accepted internally so it must be by name
      if (isExclusivityConstraintViolation(e))
        return err(new NameTaken('A policy with this name already exists'));

      throw e;
    }
  }

  async update({ account, key, name, ...policyInput }: UpdatePolicyInput) {
    // Metadata
    if (name !== undefined) {
      const updatedPolicies = await this.db.query(
        e.update(e.Policy, (p) => ({
          filter: and(e.op(p.account, '=', selectAccount(account)), e.op(p.key, '=', key)),
          set: { name },
        })),
      );

      if (!updatedPolicies.length) throw new UserInputError("Policy doesn't exist");
    }

    // State
    if (Object.values(policyInput).some((v) => v !== undefined)) {
      // Get existing policy state
      // If approvers, threshold, or permissions are undefined then modify the policy accordingly
      // Propose new state
      const selectedExisting = selectPolicy({ account, key });
      const existing = await this.db.query(
        e.select(selectedExisting, (p) => ({
          draft: e.select(p.draft.is(e.Policy), () => PolicyShape),
          ...PolicyShape,
        })),
      );
      if (!existing) throw new UserInputError("Policy doesn't exist");

      const currentState = existing.draft ?? existing;
      const currentPolicy = policyStateAsPolicy(currentState);

      const newState = policyInputAsStateShape(key, policyInput, currentState);
      const newPolicy = policyStateAsPolicy(newState);
      // TODO: update existing Policy object directly if equivalent
      if (encodePolicy(currentPolicy) === encodePolicy(newPolicy)) return ok(undefined); // Only update if policy would actually change

      await this.db.query(
        e.insert(e.Policy, {
          account: selectAccount(account),
          key,
          name: name || selectedExisting.name,
          proposal: await this.getStateProposal(account, newPolicy),
          ...this.insertStateShape(newState),
        }),
      );

      this.userAccounts.invalidateApproversCache(
        ...newState.approvers.map((a) => asAddress(a.address)),
      );
    }
  }

  async remove({ account, key }: UniquePolicyInput) {
    const proposal = await this.transactions.getInsertProposal({
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
    });

    await this.db.transaction(async () => {
      const policy = await this.db.query(
        e.select(selectPolicy({ account, key }), (p) => ({
          active: true,
          removalDrafted: e.op('exists', p.draft.is(e.RemovedPolicy)),
        })),
      );
      if (!policy || policy.removalDrafted) return;

      await this.db.query(
        e.insert(e.RemovedPolicy, {
          account: selectAccount(account),
          key,
          ...(policy.active && { proposal }),
        }),
      );
    });
  }

  validate(proposal: Tx | 'message' | null, policy: Policy | null) {
    if (!proposal) return [{ reason: 'Proposal not found', operation: -1 }];
    if (!policy) return [{ reason: 'Policy not active', operation: -1 }];

    const errors =
      proposal === 'message' ? validateMessage(policy) : validateTransaction(policy, proposal);

    return errors.map((e) => ({ reason: e.reason, operation: e.operation ?? -1 }));
  }

  async validateProposal(proposal: UUID, state: PolicyShape): Promise<ValidationError[]> {
    if (!state) return [{ reason: 'Policy not active' }];

    const p = await this.db.query(
      e.select(e.Proposal, () => ({
        filter_single: { id: proposal },
        __type__: { name: true },
        ...e.is(e.Transaction, TX_SHAPE),
        timestamp: true,
      })),
    );
    if (!p) return [{ reason: 'Proposal not found' }];

    return this.validate(
      p.__type__.name === $Transaction['__name__']
        ? transactionAsTx(p as ProposalTxShape)
        : 'message',
      policyStateAsPolicy(state),
    );
  }

  async best(account: UAddress, proposal: Tx | 'message') {
    const policies = await this.db.query(
      e.select(selectAccount(account).policies, () => ({
        id: true,
        ...PolicyShape,
      })),
    );
    if (policies.length === 0)
      throw new UserInputError('No policies for account. Account is bricked');

    const { approver } = getUserCtx();
    const sorted = (
      await Promise.all(
        policies.map(async (p) => {
          const policy = policyStateAsPolicy(p);
          const validationErrors = this.validate(proposal, policy);
          const threshold = policy.threshold - Number(policy.approvers.has(approver)); // Expect the proposer to approve

          return { id: p.id, validationErrors, ...policy, threshold };
        }),
      )
    ).sort(
      (a, b) =>
        Number(a.validationErrors.length) - Number(b.validationErrors.length) ||
        a.permissions.delay - b.permissions.delay ||
        a.threshold - b.threshold,
    );

    const p = sorted[0];
    return {
      policy: e.assert_exists(e.select(e.Policy, () => ({ filter_single: { id: p.id } }))),
      validationErrors: p.validationErrors,
    };
  }

  private insertStateShape(p: NonNullable<PolicyShape>, initState?: { account: Address }) {
    if (initState) {
      p.actions = p.actions.map((a) => {
        const functions = a.functions.map((f) => ({
          ...f,
          contract: f.contract === PLACEHOLDER_ACCOUNT_ADDRESS ? initState.account : f.contract,
        }));

        return { ...a, functions: functions as [(typeof functions)[0], ...typeof functions] };
      });
    }

    return {
      ...(initState && { activationBlock: 0n }),
      approvers: e.for(e.cast(e.str, e.set(...p.approvers.map((a) => a.address))), (approver) =>
        e.insert(e.Approver, { address: e.cast(e.str, approver) }).unlessConflict((approver) => ({
          on: approver.address,
          else: approver,
        })),
      ),
      threshold: p.threshold || p.approvers.length,
      actions: e.for(e.cast(e.json, e.set(...p.actions.map((a) => e.json(a)))), (a) =>
        e.insert(e.Action, {
          label: e.cast(e.Label, a.label),
          functions: e.for(e.json_array_unpack(a.functions), (f) =>
            e.insert(e.ActionFunction, {
              contract: e.cast(e.Address, e.json_get(f, 'contract')),
              selector: e.cast(e.Bytes4, e.json_get(f, 'selector')),
              abi: e.cast(e.json, e.json_get(f, 'abi')),
            }),
          ),
          allow: e.cast(e.bool, a.allow),
          description: e.cast(e.str, e.json_get(a, 'description')),
        }),
      ),
      transfers: e.insert(e.TransfersConfig, {
        defaultAllow: p.transfers.defaultAllow,
        budget: p.transfers.budget,
        limits: e.for(e.cast(e.json, e.set(...p.transfers.limits.map((l) => e.json(l)))), (limit) =>
          e.insert(e.TransferLimit, {
            token: e.cast(e.Address, limit.token),
            amount: e.cast(e.uint224, e.cast(e.str, limit.amount)),
            duration: e.cast(e.uint32, limit.duration),
          }),
        ),
      }),
      allowMessages: p.allowMessages,
      delay: p.delay,
    } satisfies Partial<Parameters<typeof e.insert<typeof e.Policy>>[1]>;
  }

  private async getStateProposal(account: UAddress, policy: Policy) {
    return await this.transactions.getInsertProposal({
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
