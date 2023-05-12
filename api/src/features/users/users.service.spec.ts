import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { asUser, getUser, UserContext } from '~/request/ctx';
import { DatabaseService } from '../database/database.service';
import { UsersService } from './users.service';
import e from '~/edgeql-js';
import { UpdateUserArgs } from './users.args';
import { randomUser } from '~/util/test';

describe(UsersService.name, () => {
  let service: UsersService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(UsersService);
    db = module.get(DatabaseService);
  });

  const upsert = (args?: UpdateUserArgs) =>
    service.upsert(getUser(), { name: 'user name', ...args });

  let user1: UserContext;

  beforeEach(async () => {
    user1 = randomUser();
  });

  describe('upsert', () => {
    it("create a user that doesn't exist", async () =>
      asUser(user1, async () => {
        const { id } = await upsert();

        const userQuery = e.select(e.User, () => ({ filter_single: { id } }));
        expect((await userQuery.run(db.client))?.id).toEqual(id);
      }));

    it('update an existing user', async () =>
      asUser(user1, async () => {
        const { id } = await upsert();
        const name = 'new name';
        await upsert({ name });

        const userQuery = e.select(e.User, () => ({ filter_single: { id }, name: true }));
        expect((await userQuery.run(db.client))?.name).toEqual(name);
      }));

    it('throw if not the same user', async () => {
      await asUser(user1, () => upsert());

      await asUser(randomUser(), async () => {
        expect(service.upsert(user1.address, { name: 'new name' })).rejects.toThrow();
      });
    });
  });

  describe('selectUnique', () => {
    it('returns the user', async () =>
      asUser(user1, async () => {
        const { id } = await upsert();
        expect((await service.selectUnique(user1.address)).id).toEqual(id);
      }));

    it("return a constructed user if the user doesn't exist", async () =>
      asUser(user1, async () => {
        expect((await service.selectUnique(user1.address)).address).toEqual(user1.address);
      }));

    it('return a constructed user if called by another user', async () => {
      await asUser(user1, () => upsert({ name: 'user 1 name' }));

      await asUser(randomUser(), async () => {
        const selectedUser = await service.selectUnique(user1.address);
        expect(selectedUser.address).toEqual(user1.address);
        expect(selectedUser.name).toEqual(null);
      });
    });
  });

  // describe('name', () => {
  //   it('returns contact name if the user is a contact of the caller', () =>
  //     asUser(user1, async () => {
  //       const contact: Contact = { userId: user1.address, addr: 'das', name: 'test' };
  //       jest
  //         .spyOn(prisma.asUser.contact, 'findUnique')
  //         .mockReturnValue(asPrismaPromise((async () => contact)()) as any);

  //       expect(await service.name({ id: 'das', name: 'user name' })).toEqual(contact.name);
  //     }));

  //   it('returns account name if the address is an account and the caller is a member', () =>
  //     asUser(user1, async () => {
  //       const account = { id: 'das', name: 'test' } satisfies Partial<Account>;
  //       jest
  //         .spyOn(prisma.asUser.account, 'findUnique')
  //         .mockReturnValue(asPrismaPromise((async () => account)()) as any);

  //       expect(await service.name({ id: 'das', name: 'user name' })).toEqual(account.name);
  //     }));
  // });
});
