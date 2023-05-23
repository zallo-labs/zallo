import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PoliciesService } from './policies.service';
import { Address, asPolicyKey, randomDeploySalt, ZERO_ADDR } from 'lib';
import { asUser, getUserCtx, UserContext } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { ProposalsService } from '../proposals/proposals.service';
import { UserAccountsService } from '../auth/userAccounts.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';

describe(PoliciesService.name, () => {
  let service: PoliciesService;
  let db: DatabaseService;
  let proposals: DeepMocked<ProposalsService>;
  let userAccounts: DeepMocked<UserAccountsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PoliciesService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(PoliciesService);
    db = module.get(DatabaseService);
    proposals = module.get(ProposalsService);
    userAccounts = module.get(UserAccountsService);
  });

  let user1Account: Address;
  let user1: UserContext;

  const create = async ({ activate }: { activate?: boolean } = {}) => {
    const userCtx = getUserCtx();
    const account = user1Account;

    const { id: accountId } = await e
      .insert(e.Account, {
        address: account,
        implementation: account,
        salt: randomDeploySalt(),
        isActive: false,
      })
      .run(db.client);

    userCtx.accounts.push(accountId);

    userAccounts.add.mockImplementation(async (p) => {
      if (userCtx.address === p.user && accountId === p.account) userCtx.accounts.push(accountId);
    });

    await e.insert(e.User, { address: userCtx.address }).unlessConflict().run(db.client);

    proposals.propose.mockImplementation(
      async () =>
        e.insert(e.TransactionProposal, {
          hash: hexlify(randomBytes(32)),
          account: e.select(e.Account, () => ({ filter_single: { address: account } })),
          to: ZERO_ADDR,
          feeToken: ZERO_ADDR,
          simulation: e.insert(e.Simulation, {}),
        }) as any,
    );

    const { id, key } = await service.create({
      account,
      approvers: [userCtx.address],
      permissions: {},
    });

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
    user1Account = randomAddress();
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
        expect(proposals.propose).toHaveBeenCalledTimes(1);
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

        expect(proposals.propose).toBeCalledTimes(1);
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

        expect(proposals.propose).toHaveBeenCalledTimes(1);
        await service.remove(policy);
        expect(proposals.propose).toHaveBeenCalledTimes(2);
      }));

    it('removes without a proposal if the policy is inactive', () =>
      asUser(user1, async () => {
        const policy = await create();

        expect(proposals.propose).toHaveBeenCalledTimes(1);
        await service.remove(policy);
        expect(proposals.propose).toHaveBeenCalledTimes(1);
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
