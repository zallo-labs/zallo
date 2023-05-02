import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../util/prisma/prisma.service';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { AccountsService } from './accounts.service';
import { ProviderService } from '../util/provider/provider.service';
import { CONFIG } from '~/config';
import { asUser, getUserCtx, UserContext } from '~/request/ctx';
import { randomAddress } from '~/util/test';
import { asAddress, Address, asHex } from 'lib';
import { PoliciesService } from '../policies/policies.service';
import { randomBytes } from 'ethers/lib/utils';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { AccountActivationEvent, ACCOUNTS_QUEUE } from './accounts.queue';
import { Queue } from 'bull';

CONFIG.accountImplAddress = '0xC73505BBbB8A8b07F35DE0F5588753e286423122' as Address;

describe(AccountsService.name, () => {
  let service: AccountsService;
  let prisma: PrismaService;
  let provider: DeepMocked<ProviderService>;
  let policiesService: DeepMocked<PoliciesService>;
  let accountsQueue: DeepMocked<Queue<AccountActivationEvent>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [BullModule.registerQueue(ACCOUNTS_QUEUE)],
      providers: [AccountsService, PRISMA_MOCK_PROVIDER],
    })
      .overrideProvider(getQueueToken(ACCOUNTS_QUEUE.name))
      .useValue(createMock())
      .useMocker(createMock)
      .compile();
    service = module.get(AccountsService);
    prisma = module.get(PrismaService);
    provider = module.get(ProviderService);
    policiesService = module.get(PoliciesService);
    accountsQueue = module.get(getQueueToken(ACCOUNTS_QUEUE.name));
  });

  const createAccount = async () => {
    const userCtx = getUserCtx();

    const account = randomAddress();
    provider.getProxyAddress.mockReturnValue((async () => account)());
    provider.deployProxy.mockReturnValue(
      (async () => ({
        transaction: {
          hash: asHex(randomBytes(32)),
        },
      }))() as any,
    );

    policiesService.create.mockImplementation(async (p): Promise<any> => {
      if (p.approvers.includes(userCtx.id)) userCtx.accounts.add(account);
    });

    await service.createAccount({
      name: 'Test account',
      policies: [{ approvers: [userCtx.id], permissions: {} }],
    });

    return account;
  };

  let user1: UserContext;
  let user2: UserContext;
  let user1Account: Address;

  beforeEach(async () => {
    user1 = {
      id: randomAddress(),
      accounts: new Set([]),
    };
    user2 = {
      id: randomAddress(),
      accounts: new Set([]),
    };

    await asUser(user1, async () => {
      user1Account = await createAccount();
    });
  });

  describe('createAccount', () => {
    it('creates an account', () =>
      asUser(user1, async () => {
        expect(
          await prisma.asUser.account.findUnique({ where: { id: user1Account } }),
        ).toBeTruthy();
      }));

    it('activates the account', () =>
      asUser(user1, async () => {
        expect(provider.deployProxy).toHaveBeenCalledTimes(1);
      }));
  });

  describe('account', () => {
    it('returns correct account', () =>
      asUser(user1, async () => {
        expect(
          (
            await service.findUnique({
              where: { id: user1Account },
            })
          )?.id,
        ).toEqual(user1Account);
      }));

    it("returns null if the account doesn't exist", () =>
      asUser(user1, async () => {
        expect(await service.findUnique({ where: { id: randomAddress() } })).toBeNull();
      }));

    it("returns null if the user isn't a member of the account specified", () =>
      asUser(user2, async () => {
        expect(await service.findUnique({ where: { id: user1Account } })).toBeNull();
      }));
  });

  describe('accounts', () => {
    it('returns user accounts', () =>
      asUser(user1, async () => {
        const accounts = (await service.findMany({})).map((acc) => asAddress(acc.id));
        expect(new Set(accounts)).toEqual(user1.accounts);
      }));

    it("doesn't return accounts the user isn't a member of", async () => {
      await asUser(user2, async () => {
        await createAccount();
        const accounts = (await service.findMany({})).map((acc) => asAddress(acc.id));

        expect(new Set(accounts)).toEqual(user2.accounts);
      });
    });
  });

  describe('updateAccountMetadata', () => {
    const newName = 'foo';

    it('updates metadata', () =>
      asUser(user1, async () => {
        await service.updateAccount({ id: user1Account, name: newName });
        expect((await service.findUnique({ where: { id: user1Account } }))?.name).toEqual(newName);
      }));

    it('publishes account', () =>
      asUser(user1, async () => {
        // expect(service.publishAccount).toBeCalledTimes(1); // beforeEach
        await service.updateAccount({ id: user1Account, name: newName });
        // expect(service.publishAccount).toBeCalledTimes(2); // Once more
      }));

    it('throws if user is not member of account being updated', () =>
      asUser(user2, async () => {
        await expect(service.updateAccount({ id: user1Account, name: newName })).rejects.toThrow();
      }));
  });
});
