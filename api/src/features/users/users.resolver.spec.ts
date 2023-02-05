import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { Account, Contact } from '@prisma/client';
import { asUser, UserContext } from '~/request/ctx';
import { asPrismaPromise, randomAddress } from '~/util/test';
import { PrismaService } from '../util/prisma/prisma.service';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { User } from '@gen/user/user.model';
import { UsersResolver } from './users.resolver';

describe(UsersResolver.name, () => {
  let resolver: UsersResolver;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersResolver, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get(UsersResolver);
    prisma = module.get(PrismaService);
  });

  const create = () => resolver.updateUser({ name: 'name', pushToken: '' });

  let user1: UserContext;
  let user1Obj: User;

  beforeEach(async () => {
    user1 = { id: randomAddress(), accounts: new Set() };
    user1Obj = await asUser(user1, () => create());
  });

  describe('user', () => {
    it('returns user', () =>
      asUser(user1, async () => {
        expect((await resolver.user({ id: user1.id }))?.id).toEqual(user1Obj.id);
      }));

    it("returns constructed user if the user doesn't exist", () =>
      asUser(user1, async () => {
        const nonexistentUser = randomAddress();
        expect((await resolver.user({ id: nonexistentUser })).id).toEqual(nonexistentUser);
      }));
  });

  describe('name', () => {
    it('returns contact name if the user is a contact of the caller', () =>
      asUser(user1, async () => {
        const contact: Contact = { userId: user1.id, addr: 'das', name: 'test' };
        jest
          .spyOn(prisma.asUser.contact, 'findUnique')
          .mockReturnValue(asPrismaPromise((async () => contact)()) as any);

        expect(await resolver.name({ id: 'das', name: 'user name', pushToken: null })).toEqual(
          contact.name,
        );
      }));

    it('returns account name if the address is an account and the caller is a member', () =>
      asUser(user1, async () => {
        const account = { id: 'das', name: 'test' } satisfies Partial<Account>;
        jest
          .spyOn(prisma.asUser.account, 'findUnique')
          .mockReturnValue(asPrismaPromise((async () => account)()) as any);

        expect(await resolver.name({ id: 'das', name: 'user name', pushToken: null })).toEqual(
          account.name,
        );
      }));
  });
});
