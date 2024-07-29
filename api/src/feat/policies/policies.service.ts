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
  Address,
  UAddress,
  PLACEHOLDER_ACCOUNT_ADDRESS,
  Tx,
  UUID,
  asUUID,
  PolicyKey,
} from 'lib';
import { TransactionsService } from '../transactions/transactions.service';
import {
  PolicyInput,
  ProposePoliciesInput,
  UniquePolicyInput,
  UpdatePolicyDetailsInput,
} from './policies.input';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { ShapeFunc } from '~/core/database';
import {
  policyStateAsPolicy,
  PolicyShape,
  policyInputAsStateShape,
  selectPolicy,
  latestPolicy2,
  inputAsPolicy,
} from './policies.util';
import { NameTaken, PolicyEvent, Policy as PolicyModel, ValidationError } from './policies.model';
import { TX_SHAPE, transactionAsTx, ProposalTxShape } from '../transactions/transactions.util';
import { selectAccount, selectAccount2 } from '../accounts/accounts.util';
import { encodeFunctionData } from 'viem';
import { $Transaction } from '~/edgeql-js/modules/default';
import { getUserCtx } from '~/core/context';
import { PubsubService } from '~/core/pubsub/pubsub.service';
import { existingPolicies } from './existing-policies.query';
import { insertPolicies } from './insert-policies.query';
import { updatePolicyDetails } from './update-policy-details.query';
import { ConstraintViolationError } from 'edgedb';

export const MIN_AUTO_POLICY_KEY = 32; // 2^5; keys [0, 31] are reserved for manual keys

export interface PolicyUpdatedPayload {
  event: PolicyEvent;
  account: UAddress;
  policyId: UUID;
}
const policyUpdatedTrigger = (account: UAddress) => `account.policy:${account}`;

export type ProposePoliciesParams = ProposePoliciesInput & {
  isInitialization?: boolean;
};

@Injectable()
export class PoliciesService {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
    private userAccounts: AccountsCacheService,
    private pubsub: PubsubService,
  ) {}

  async selectUnique(id: UUID, shape?: ShapeFunc) {
    return this.db.queryWith2({ id: e.uuid }, { id }, ({ id }) =>
      e.select(e.Policy, (p) => ({
        filter_single: { id },
        ...shape?.(p),
      })),
    );
  }

  async latest(unique: { account: UAddress; key: number }, shape?: ShapeFunc) {
    return (await this.db.queryWith(
      { account: e.UAddress, key: e.int64 },
      ({ account, key }) => e.select(latestPolicy2(account, key), (p) => ({ ...shape?.(p) })),
      { account: unique.account, key: unique.key },
    )) as unknown as PolicyModel | null;
  }

  async policies(ids: UUID[], shape?: ShapeFunc) {
    if (!ids.length) return [];

    return await this.db.queryWith(
      { ids: e.array(e.uuid) },
      ({ ids }) =>
        e.select(e.Policy, (p) => ({
          filter: e.op(p.id, 'in', e.array_unpack(ids)),
          ...shape?.(p),
        })),
      { ids },
    );
  }

  async propose(
    { account, isInitialization }: Omit<ProposePoliciesParams, 'policies'>,
    ...policies: PolicyInput[]
  ) {
    let autoKey = policies.some((p) => p.key === undefined)
      ? await this.getNextKey(account)
      : asPolicyKey(0);
    const policiesWithKeys = policies.map((p) => ({
      ...p,
      key: (p.key ?? autoKey++) as PolicyKey,
    }));

    // Only draft if it differs from existing
    const policyKeys = policiesWithKeys.map((p) => p.key);
    const currentPolicies = await this.db.exec(existingPolicies, { account, policyKeys });
    const changedPolicies = policiesWithKeys
      .map((input) => {
        const policy = inputAsPolicy(input.key, input);
        const existing = currentPolicies.find((p) => p.key === policy.key);
        return (
          (!existing || encodePolicy(policy) !== encodePolicy(policyStateAsPolicy(existing))) && {
            input,
            policy,
          }
        );
      })
      .filter(Boolean);
    if (!changedPolicies.length) return [];

    // Propose transaction with policy inserts
    const transaction = !isInitialization
      ? await this.transactions.propose({
          label: 'Update ' + (changedPolicies.length === 1 ? 'policy' : 'policies'),
          account,
          operations: changedPolicies.map(({ policy }) => ({
            to: asAddress(account),
            data: encodeFunctionData({
              abi: ACCOUNT_ABI,
              functionName: 'addPolicy',
              args: [encodePolicyStruct(policy)],
            }),
          })),
        })
      : undefined;

    // Insert changed policies
    const newPolicies = (
      await this.db.exec(insertPolicies, {
        account,
        transaction,
        policies: changedPolicies.map(({ input }) => ({
          ...(isInitialization && { activationBlock: 0n }),
          ...policyInputAsStateShape(input.key, input),
          name: input.name || 'Policy ' + input.key,
        })),
      })
    ).map((p) => ({ ...p, id: asUUID(p.id), key: asPolicyKey(p.key) }));

    const approvers = new Set(changedPolicies.flatMap(({ input }) => input.approvers));
    this.userAccounts.invalidateApproversCache(...approvers);

    newPolicies.forEach(({ id }) =>
      this.event({ event: PolicyEvent.created, account, policyId: id }),
    );

    return newPolicies;
  }

  async updateDetails({ account, key, name }: UpdatePolicyDetailsInput) {
    try {
      const r = await this.db.exec(updatePolicyDetails, { account, key, name });
      return r;
    } catch (e) {
      if (e instanceof ConstraintViolationError && e.message.includes('name'))
        return new NameTaken(e.message); // TODO: message indicating which key and name is invalid
    }
  }

  async remove({ account, key }: UniquePolicyInput) {
    const policy = await this.db.query(
      e.select(selectPolicy({ account, key }), (p) => ({
        isActive: true,
        removalDrafted: e.op('exists', p.draft.is(e.RemovedPolicy)),
      })),
    );
    if (!policy || policy.removalDrafted) return;

    const transaction =
      policy.isActive &&
      (await this.transactions.propose({
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

    await this.db.queryWith2(
      { account: e.UAddress, key: e.uint16, transaction: e.optional(e.uuid) },
      { account, key, transaction: transaction || undefined },
      ({ account, key, transaction }) =>
        e.insert(e.RemovedPolicy, {
          account: selectAccount2(account),
          key,
          proposal: e.select(e.Transaction, () => ({ filter_single: { id: transaction } })),
        }),
    );
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
    const policies = await this.db.queryWith(
      { account: e.UAddress },
      ({ account }) =>
        e.select(selectAccount2(account).policies, (p) => ({
          id: true,
          isActive: true,
          ...PolicyShape,
        })),
      { account },
    );
    if (policies.length === 0)
      throw new UserInputError('No policies for account. Account is bricked');

    const { approver } = getUserCtx();
    const sorted = policies
      .map((p) => {
        const policy = policyStateAsPolicy(p);
        const validationErrors = this.validate(proposal, policy);
        const threshold = policy.threshold - Number(policy.approvers.has(approver)); // Expect the proposer to approve

        return { id: p.id, validationErrors, ...policy, threshold, isActive: p.isActive };
      })
      .sort(
        (a, b) =>
          Number(a.validationErrors.length) - Number(b.validationErrors.length) ||
          Number(b.isActive) - Number(a.isActive) ||
          a.permissions.delay - b.permissions.delay ||
          a.threshold - b.threshold,
      );

    const p = sorted[0];
    return {
      policyId: p.id,
      policy: e.assert_exists(e.select(e.Policy, () => ({ filter_single: { id: p.id } }))),
      policyKey: p.key,
      validationErrors: p.validationErrors,
    };
  }

  subscribe(accounts: UAddress[] = getUserCtx().accounts.map((a) => a.address)) {
    return this.pubsub.asyncIterator(accounts.map(policyUpdatedTrigger));
  }

  event(payload: PolicyUpdatedPayload) {
    this.pubsub.event<PolicyUpdatedPayload>(policyUpdatedTrigger(payload.account), payload);
  }

  private async getNextKey(account: UAddress) {
    const maxKey = (await this.db.query(e.select(e.max(selectAccount(account).policies.key)))) as
      | number
      | null;

    return asPolicyKey(Math.max(MIN_AUTO_POLICY_KEY, maxKey !== null ? maxKey + 1 : 0));
  }
}
