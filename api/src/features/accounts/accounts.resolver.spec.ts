import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import * as lib from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { AccountsResolver } from './accounts.resolver';
import { ProviderService } from '../util/provider/provider.service';
import { CONFIG } from '~/config';
import { AccountsService } from './accounts.service';
import { asUser, UserContext } from '~/request/ctx';
import { randomAddress } from '~/util/test';
import { asAddress, Address } from 'lib';

CONFIG.accountImplAddress = '0xC73505BBbB8A8b07F35DE0F5588753e286423122' as Address;

jest.mock('lib', () => ({
  __esModule: true,
  ...jest.requireActual('lib'),
  calculateProxyAddress: jest.fn(),
}));
const mockedCalculateProxyAddress = jest.mocked(lib.calculateProxyAddress);

describe(AccountsResolver.name, () => {
  let resolver: AccountsResolver;
  let service: DeepMocked<AccountsService>;
  let prisma: PrismaService;
  let provider: DeepMocked<ProviderService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AccountsResolver, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();
    resolver = module.get(AccountsResolver);
    service = module.get(AccountsService);
    prisma = module.get(PrismaService);

    provider = module.get(ProviderService);
    provider.useProxyFactory.mockImplementation(async (f) => f(undefined as any));
  });

  const createAccount = async (user: UserContext, account: lib.Address) => {
    mockedCalculateProxyAddress.mockReturnValue((async () => account)());

    await resolver.createAccount({
      name: 'Test account',
      policies: [{ approvers: [user.id], permissions: {} }],
    });
    user.accounts.add(account);
  };

  let user1Account: Address;
  let user1: UserContext;
  let user2Account: Address;
  let user2: UserContext;

  beforeEach(async () => {
    user1Account = randomAddress();
    user1 = {
      id: randomAddress(),
      accounts: new Set([user1Account]),
    };
    user2Account = randomAddress();
    user2 = {
      id: randomAddress(),
      accounts: new Set([user2Account]),
    };

    await asUser(user1, async () => {
      await createAccount(user1, user1Account);
    });
  });

  describe('createAccount', () => {
    it('creates an account', () =>
      asUser(user1, async () => {
        expect(
          await prisma.asUser.account.findUnique({ where: { id: user1Account } }),
        ).toBeTruthy();
      }));

    it('activates the account', async () => {
      expect(service.activateAccount).toHaveBeenCalledTimes(1);
    });

    it('publishes the account', async () => {
      expect(service.publishAccount).toHaveBeenCalledTimes(1);
    });
  });

  describe('account', () => {
    it('returns correct account', () =>
      asUser(user1, async () => {
        expect((await resolver.account({ id: user1Account }))?.id).toEqual(user1Account);
      }));

    it("returns null if the account doesn't exist", () =>
      asUser(user1, async () => {
        expect(await resolver.account({ id: randomAddress() })).toBeNull();
      }));

    it("returns null if the user isn't a member of the account specified", () =>
      asUser(user2, async () => {
        expect(await resolver.account({ id: user1Account })).toBeNull();
      }));
  });

  describe('accounts', () => {
    it('returns user accounts', () =>
      asUser(user1, async () => {
        const accounts = (await resolver.accounts({})).map((acc) => asAddress(acc.id));
        expect(new Set(accounts)).toEqual(user1.accounts);
      }));

    it("doesn't return accounts the user isn't a member of", async () => {
      await asUser(user2, async () => {
        await createAccount(user2, user2Account);
        const accounts = (await resolver.accounts({})).map((acc) => asAddress(acc.id));

        expect(new Set(accounts)).toEqual(user2.accounts);
      });
    });
  });

  describe('updateAccountMetadata', () => {
    const newName = 'foo';

    it('updates metadata', () =>
      asUser(user1, async () => {
        await resolver.updateAccount({ id: user1Account, name: newName });
        expect((await resolver.account({ id: user1Account }))?.name).toEqual(newName);
      }));

    it('publishes account', () =>
      asUser(user1, async () => {
        expect(service.publishAccount).toBeCalledTimes(1); // beforeEach
        await resolver.updateAccount({ id: user1Account, name: newName });
        expect(service.publishAccount).toBeCalledTimes(2); // Once more
      }));

    it('throws if user is not member of account being updated', () =>
      asUser(user2, async () => {
        await expect(resolver.updateAccount({ id: user1Account, name: newName })).rejects.toThrow();
      }));
  });
});
