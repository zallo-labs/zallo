import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreatePolicyParams, PoliciesService } from './policies.service';
import { asPolicyKey, asSelector, randomDeploySalt, randomHex, UAddress, ZERO_ADDR } from 'lib';
import { asUser, getUserCtx, UserContext } from '~/request/ctx';
import { randomAddress, randomLabel, randomUAddress, randomUser } from '~/util/test';
import { TransactionProposalsService } from '../transaction-proposals/transaction-proposals.service';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import {
  inputAsPolicy,
  policyStateAsPolicy,
  policyStateShape,
  uniquePolicy,
} from './policies.util';
import assert from 'assert';
import { PolicyInput } from './policies.input';
import { v1 as uuidv1 } from 'uuid';

describe(PoliciesService.name, () => {
  let service: PoliciesService;
  let db: DatabaseService;
  let proposals: DeepMocked<TransactionProposalsService>;
  let userAccounts: DeepMocked<AccountsCacheService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PoliciesService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(PoliciesService);
    db = module.get(DatabaseService);
    proposals = module.get(TransactionProposalsService);
    userAccounts = module.get(AccountsCacheService);
  });

  let user1Account: UAddress;
  let user1: UserContext;

  const create = async ({
    activate,
    ...params
  }: Partial<CreatePolicyParams> & { activate?: boolean } = {}) => {
    const userCtx = getUserCtx();
    const account = user1Account;

    const accountId = uuidv1();
    userCtx.accounts.push({ id: accountId, address: account });

    await e
      .insert(e.Account, {
        id: accountId,
        address: account,
        label: randomLabel(),
        implementation: account,
        salt: randomDeploySalt(),
        isActive: false,
      })
      .run(db.client);

    // userAccounts.addCachedAccount.mockImplementation(async (p) => {
    //   if (userCtx.approver === p.approver && accountId === p.account)
    //     userCtx.accounts.push(accountId);
    // });

    await e.insert(e.Approver, { address: userCtx.approver }).unlessConflict().run(db.client);

    proposals.getProposal.mockImplementation(async () => {
      const hash = randomHex(32);

      return {
        hash,
        insert: e.insert(e.TransactionProposal, {
          hash,
          account: e.select(e.Account, () => ({ filter_single: { address: account } })),
          operations: e.insert(e.Operation, { to: ZERO_ADDR }),
          validFrom: new Date(),
          feeToken: e.assert_single(
            e.select(e.Token, (t) => ({
              filter: t.isFeeToken,
              limit: 1,
            })),
          ),
        }),
      };
    });

    const { id, key } = (
      await service.create({
        account,
        approvers: [userCtx.approver],
        ...params,
      })
    )._unsafeUnwrap();

    if (activate) {
      await e
        .update(e.PolicyState, () => ({
          filter_single: {
            id: e.select(e.Policy, () => ({
              filter_single: { id },
              draft: { id: true },
            })).draft.id,
          },
          set: {
            activationBlock: 0n,
          },
        }))
        .run(db.client);
    }

    return { id, account, key };
  };

  beforeEach(() => {
    user1Account = randomUAddress();
    user1 = randomUser();
  });

  describe('create', () => {
    it('create policy', () =>
      asUser(user1, async () => {
        const { id } = await create();

        expect(
          await e.select(e.Policy, () => ({ filter_single: { id } })).run(db.client),
        ).toBeTruthy();
      }));

    it('creates state', () =>
      asUser(user1, async () => {
        const { id } = await create();

        const policy = await e
          .select(e.Policy, () => ({
            filter_single: { id },
            stateHistory: { id: true },
          }))
          .run(db.client);

        expect(policy?.stateHistory).toHaveLength(1);
      }));

    it('proposes an upsert', () =>
      asUser(user1, async () => {
        await create();
        expect(proposals.getProposal).toHaveBeenCalled();
      }));

    it('inserts correct policy', () =>
      asUser(user1, async () => {
        const key = asPolicyKey(125);
        const policyInput: PolicyInput = {
          approvers: [getUserCtx().approver, randomAddress()],
          threshold: 1,
          actions: [
            {
              label: 'my action',
              functions: [
                { contract: randomAddress(), selector: asSelector('0x12345678') },
                { contract: randomAddress() },
                { selector: asSelector('0x12345678') },
              ],
              allow: true,
            },
            {
              label: 'Anything else',
              functions: [{}],
              allow: false,
            },
          ],
          transfers: {
            limits: [{ token: randomAddress(), amount: 4n, duration: 25 }],
            budget: 10,
            defaultAllow: false,
          },
        };
        const expectedPolicy = inputAsPolicy(key, policyInput);

        const { id } = await create({ ...policyInput, key });

        const p = await e
          .select(e.Policy, (p) => ({
            ...uniquePolicy({ id })(p),
            draft: policyStateShape,
          }))
          .run(db.client);

        assert(p?.draft);
        const actualPolicy = policyStateAsPolicy(key, p.draft);

        expect(actualPolicy).toEqual(expectedPolicy);
      }));
  });

  describe('update', () => {
    it('updates name', () =>
      asUser(user1, async () => {
        const policy = await create();
        const newName = 'new';
        await service.update({ ...policy, name: newName });

        const select = e.select(e.Policy, (p) => ({
          filter_single: { id: policy.id },
          name: true,
        }));

        expect((await select.run(db.client))?.name).toEqual(newName);
      }));

    it('creates state', () =>
      asUser(user1, async () => {
        const policy = await create();
        await service.update({ ...policy, approvers: [] });

        const policyWithStates = await e
          .select(e.Policy, () => ({
            filter_single: { id: policy.id },
            stateHistory: { id: true },
          }))
          .run(db.client);

        expect(policyWithStates?.stateHistory).toHaveLength(2);
      }));

    it('propose', () =>
      asUser(user1, async () => {
        const policy = await create();

        expect(proposals.getProposal).toBeCalledTimes(1);
        await service.update({ ...policy, approvers: [] });
      }));

    it("throws if the user isn't a member of the account", async () => {
      const policy = await asUser(user1, create);

      await asUser(randomUser(), () =>
        expect(service.update({ ...policy, name: '' })).rejects.toThrow(),
      );
    });

    it("throws if the policy doesn't exist", () =>
      asUser(user1, async () => {
        await expect(
          service.update({
            account: user1Account,
            key: asPolicyKey(10),
            approvers: [],
          }),
        ).rejects.toThrow();
      }));
  });

  describe('remove', () => {
    it('creates a removed state', () =>
      asUser(user1, async () => {
        const policy = await create();
        await service.remove(policy);

        const selected = await e
          .select(e.Policy, (p) => ({
            filter_single: { id: policy.id },
            nRemovedPolicies: e.count(
              e.select(p.stateHistory, (state) => ({
                filter: e.op(state.isRemoved, '=', true),
              })),
            ),
          }))
          .run(db.client);

        expect(selected?.nRemovedPolicies).toEqual(1);
      }));

    it('proposes a remove if the policy is active', () =>
      asUser(user1, async () => {
        const policy = await create({ activate: true });

        proposals.getProposal.mockClear();
        await service.remove(policy);
        expect(proposals.getProposal).toHaveBeenCalled();
      }));

    it('removes without a proposal if the policy is inactive', () =>
      asUser(user1, async () => {
        const policy = await create();

        proposals.getProposal.mockClear();
        await service.remove(policy);
        expect(proposals.getProposal).not.toHaveBeenCalled();
      }));

    it("throws if the user isn't a member of the account", async () => {
      const policy = await asUser(user1, create);

      await asUser(randomUser(), () => expect(service.remove(policy)).rejects.toThrow());
    });
  });

  describe('delete', () => {
    it('should not delete active policy', () =>
      asUser(user1, async () => {
        const policy = await create({ activate: true });

        const deleteQuery = e.delete(e.Policy, () => ({
          filter_single: { id: policy.id },
        }));

        expect(await deleteQuery.run(db.client)).toBeNull();
      }));
  });
});
