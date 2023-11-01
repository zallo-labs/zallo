import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ProviderService } from '../util/provider/provider.service';
import { CONFIG } from '~/config';
import { asUser, getUserCtx, UserContext } from '~/request/ctx';
import { randomAddress, randomHash, randomName, randomUser } from '~/util/test';
import { Address } from 'lib';
import { PoliciesService } from '../policies/policies.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { AccountActivationEvent, ACCOUNTS_QUEUE } from './accounts.queue';
import { Queue } from 'bull';
import { DatabaseService } from '../database/database.service';
import { AccountsService } from './accounts.service';
import e from '~/edgeql-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { AccountsCacheService } from '../auth/accounts.cache.service';

(CONFIG as any).accountImplAddress = randomAddress();

describe(AccountsService.name, () => {
  let service: AccountsService;
  let db: DatabaseService;
  let provider: DeepMocked<ProviderService>;
  let policies: DeepMocked<PoliciesService>;
  let accountsQueue: DeepMocked<Queue<AccountActivationEvent>>;
  let accountsCache: DeepMocked<AccountsCacheService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [BullModule.registerQueue(ACCOUNTS_QUEUE)],
      providers: [AccountsService, DatabaseService],
    })
      .overrideProvider(getQueueToken(ACCOUNTS_QUEUE.name))
      .useValue(createMock())
      .useMocker(createMock)
      .compile();
    service = module.get(AccountsService);
    db = module.get(DatabaseService);
    provider = module.get(ProviderService);
    policies = module.get(PoliciesService);
    accountsQueue = module.get(getQueueToken(ACCOUNTS_QUEUE.name));
    accountsCache = module.get(AccountsCacheService);

    accountsCache.addCachedAccount.mockImplementation(async ({ approver, account }) => {
      const userCtx = getUserCtx();
      if (approver === userCtx.approver) userCtx.accounts.push(account);
    });
  });

  const createAccount = async () => {
    const userCtx = getUserCtx();

    const account = randomAddress();
    provider.getProxyAddress.mockReturnValue((async () => account)());
    provider.deployProxy.mockReturnValue(
      (async () => ({
        account: {
          address: account,
        },
        transaction: {
          hash: randomHash(),
        },
      }))() as any,
    );

    return service.createAccount({
      name: randomName(),
      policies: [{ approvers: [userCtx.approver], permissions: {} }],
    });
  };

  let user1: UserContext;
  let user1Account: Address;
  let user1AccountId: uuid;

  beforeEach(async () => {
    user1 = randomUser();

    await asUser(user1, async () => {
      const { id, address } = await createAccount();
      user1Account = address;
      user1AccountId = id;
    });
  });

  describe('createAccount', () => {
    it('creates an account', () =>
      asUser(user1, async () => {
        const query = e.select(e.Account, () => ({
          filter_single: { address: user1Account },
        }));
        expect(await query.run(db.client)).toBeTruthy();
      }));

    it('activates the account', () =>
      asUser(user1, async () => {
        expect(provider.deployProxy).toHaveBeenCalledTimes(1);
      }));
  });

  describe('account', () => {
    it('returns correct account', () =>
      asUser(user1, async () => {
        expect((await service.selectUnique(user1Account))?.id).toEqual(user1AccountId);
      }));

    it("returns null if the account doesn't exist", () =>
      asUser(user1, async () => {
        expect(await service.selectUnique(randomAddress())).toBeNull();
      }));

    it("returns null if the user isn't a member of the account specified", () =>
      asUser(randomUser(), async () => {
        expect(await service.selectUnique(user1Account)).toBeNull();
      }));
  });

  describe('accounts', () => {
    it('returns user accounts', () =>
      asUser(user1, async () => {
        const accounts = (await service.select({})).map((acc) => acc.id);

        expect(accounts).toEqual(user1.accounts.map((a) => a.id));
      }));

    it("doesn't return accounts the user isn't a member of", async () => {
      const user2 = randomUser();
      await asUser(user2, async () => {
        await createAccount();
        const accounts = (await service.select({})).map((acc) => acc.id);

        expect(accounts).toEqual(user2.accounts.map((a) => a.id));
      });
    });
  });

  describe('updateAccountMetadata', () => {
    const newName = 'foo';

    it('updates metadata', () =>
      asUser(user1, async () => {
        await service.updateAccount({ address: user1Account, name: newName });
        expect((await service.selectUnique(user1Account, () => ({ name: true })))?.name).toEqual(
          newName,
        );
      }));

    it('publishes account', () =>
      asUser(user1, async () => {
        service.publishAccount = jest.fn();
        await service.updateAccount({ address: user1Account, name: newName });
        expect(service.publishAccount).toBeCalledTimes(1);
      }));

    it('throws if user is not member of account being updated', () =>
      asUser(randomUser(), async () => {
        await expect(
          service.updateAccount({ address: user1Account, name: newName }),
        ).rejects.toThrow();
      }));
  });
});
