import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreatePolicyParams, PoliciesService } from './policies.service';
import {
  asPolicyKey,
  asSelector,
  asUUID,
  randomDeploySalt,
  randomHex,
  UAddress,
  ZERO_ADDR,
} from 'lib';
import { UserContext } from '~/core/context';
import { asUser, getUserCtx } from '~/core/context';
import { randomAddress, randomLabel, randomUAddress, randomUser } from '~/util/test';
import { TransactionsService } from '../transactions/transactions.service';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { inputAsPolicy, policyStateAsPolicy, PolicyShape, selectPolicy } from './policies.util';
import { PolicyInput } from './policies.input';
import { v1 as uuidv1 } from 'uuid';
import { selectAccount } from '../accounts/accounts.util';
import { and } from '~/core/database';

describe(PoliciesService.name, () => {
  let service: PoliciesService;
  let db: DatabaseService;
  let proposals: DeepMocked<TransactionsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PoliciesService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(PoliciesService);
    db = module.get(DatabaseService);
    proposals = module.get(TransactionsService);
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
    await e.insert(e.Approver, { address: userCtx.approver }).unlessConflict().run(db.client);

    await db.query(
      e.insert(e.Account, {
        id: accountId,
        address: account,
        name: randomLabel(),
        implementation: randomAddress(),
        salt: randomDeploySalt(),
      }),
    );

    const initPolicy = (
      await service.create({
        account,
        approvers: [userCtx.approver],
        initState: true,
      })
    )._unsafeUnwrap();

    proposals.propose.mockImplementation(async () => {
      const hash = randomHex(32);

      const { id } = await db.query(
        e.insert(e.Transaction, {
          hash,
          account: selectAccount(account),
          policy: selectPolicy(initPolicy.id),
          validationErrors: [],
          unorderedOperations: e.insert(e.Operation, { to: ZERO_ADDR }),
          timestamp: new Date(),
          paymaster: ZERO_ADDR,
          feeToken: e.assert_single(
            e.select(e.Token, (t) => ({
              filter: t.isFeeToken,
              limit: 1,
            })),
          ),
          maxAmount: '1',
        }),
      );

      return asUUID(id);
    });

    const { id, key } = (
      await service.create({
        account,
        approvers: [userCtx.approver],
        ...params,
      })
    )._unsafeUnwrap();

    if (activate) {
      await db.query(
        e.update(e.PolicyState, () => ({
          filter_single: { id },
          set: { activationBlock: 0n },
        })),
      );
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

    it('proposes an upsert', () =>
      asUser(user1, async () => {
        await create();
        expect(proposals.propose).toHaveBeenCalled();
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

        const p = await db.query(e.select(selectPolicy(id), () => PolicyShape));
        const actualPolicy = policyStateAsPolicy(p);
        expect(actualPolicy).toEqual(expectedPolicy);
      }));
  });

  describe('update', () => {
    it('creates draft state', () =>
      asUser(user1, async () => {
        const { account, key } = await create();
        await service.update({ account, key, approvers: [] });

        const states = await db.query(
          e.select(e.Policy, (p) => ({
            filter: and(e.op(p.account, '=', selectAccount(account)), e.op(p.key, '=', key)),
          })),
        );

        expect(states).toHaveLength(2);
      }));

    it('proposes transaction', () =>
      asUser(user1, async () => {
        const policy = await create();

        expect(proposals.propose).toHaveBeenCalled();
        await service.update({ ...policy, approvers: [] });
      }));

    it('updates names', () =>
      asUser(user1, async () => {
        const { account, key } = await create();
        const newName = 'new name';
        await service.update({ account, key, name: newName });

        const names = e.select(e.Policy, (p) => ({
          filter: and(e.op(p.account, '=', selectAccount(account)), e.op(p.key, '=', key)),
        })).name;

        expect(await db.query(names)).toEqual([newName]);
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
    it('becomes draft of active policy', () =>
      asUser(user1, async () => {
        const { account, key } = await create({ activate: true });
        await service.remove({ account, key });

        const removalDrafted = await db.query(
          e.select(selectPolicy({ account, key }), (p) => ({
            removalDrafted: e.op('exists', p.draft.is(e.RemovedPolicy)),
          })).removalDrafted,
        );
        expect(removalDrafted).toBeTruthy();
      }));

    it('proposes a remove if the policy is active', () =>
      asUser(user1, async () => {
        const policy = await create({ activate: true });

        proposals.propose.mockClear();
        await service.remove(policy);
        expect(proposals.propose).toHaveBeenCalled();
      }));

    it('removes without a proposal if the policy is inactive', () =>
      asUser(user1, async () => {
        const policy = await create();

        proposals.propose.mockClear();
        await service.remove(policy);
        expect(proposals.propose).not.toHaveBeenCalled();
      }));

    it("returns undefined if the user isn't a member of the account", async () => {
      const policy = await asUser(user1, create);

      await asUser(randomUser(), async () =>
        expect(await service.remove(policy)).toEqual(undefined),
      );
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
