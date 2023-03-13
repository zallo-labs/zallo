import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Address } from 'lib';
import { asUser, UserContext } from '~/request/ctx';
import { asPrismaPromise, randomAddress } from '~/util/test';
import { AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../util/prisma/prisma.service';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { ContactsResolver } from './contacts.resolver';

describe('ContactsResolver', () => {
  let resolver: ContactsResolver;
  let prisma: PrismaService;
  let accounts: DeepMocked<AccountsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsResolver, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get(ContactsResolver);
    prisma = module.get(PrismaService);
    accounts = module.get(AccountsService);
  });

  let user1: UserContext;
  let user2: UserContext;
  let user1Contact: Address;

  beforeEach(async () => {
    user1 = { id: randomAddress(), accounts: new Set() };
    user2 = { id: randomAddress(), accounts: new Set() };
    user1Contact = randomAddress();
  });

  const upsertContact = (addr: Address, name = `${addr} contact`) =>
    resolver.upsertContact({ name, newAddr: addr });

  describe('upsertContact', () => {
    it("creates a contact if the contact didn't already exist", () =>
      asUser(user1, async () => {
        await upsertContact(user1Contact);

        expect(
          await prisma.asUser.contact.findUnique({
            where: { userId_addr: { userId: user1.id, addr: user1Contact } },
          }),
        ).toBeTruthy();
      }));

    it('updates a contact if it already existed', () =>
      asUser(user1, async () => {
        const newName = 'b';
        await upsertContact(user1Contact, 'a');
        await upsertContact(user1Contact, newName);

        expect(
          (
            await prisma.asUser.contact.findUnique({
              where: { userId_addr: { userId: user1.id, addr: user1Contact } },
            })
          )?.name,
        ).toEqual(newName);
      }));

    it('only allow unique names (within the scope of a user)', () =>
      asUser(user1, async () => {
        const name = 'a';
        await upsertContact(user1Contact, name);
        await expect(upsertContact(randomAddress(), name)).rejects.toThrow();
      }));
  });

  describe('contact', () => {
    it('returns contact for user', () =>
      asUser(user1, async () => {
        await upsertContact(user1Contact);
        expect((await resolver.contact({ addr: user1Contact }))?.addr).toEqual(user1Contact);
      }));

    it("returns null if the contact doesn't exist", () =>
      asUser(user1, async () => {
        expect(await resolver.contact({ addr: user1Contact })).toBeNull();
      }));

    it("doesn't return contact of another user", async () => {
      await asUser(user1, () => upsertContact(user1Contact));

      await asUser(user2, async () =>
        expect(await resolver.contact({ addr: user1Contact })).toBeNull(),
      );
    });
  });

  describe('contacts', () => {
    it("returns all user's contacts", () =>
      asUser(user1, async () => {
        const expectedContacts = new Set([user1Contact, randomAddress()]);
        await Promise.all([...expectedContacts].map((contact) => upsertContact(contact)));

        const contacts = (await resolver.contacts({})).map((c) => c.addr);
        expect(new Set(contacts)).toEqual(expectedContacts);
      }));

    it("includes user's accounts", () =>
      asUser(user1, async () => {
        const account = randomAddress();
        accounts.findMany.mockReturnValueOnce(
          asPrismaPromise([{ id: account, name: '', impl: '', deploySalt: '', isActive: false }]),
        );

        const contacts = await resolver.contacts({});
        expect(contacts.map((c) => c.addr)).toEqual([account]);
      }));

    it("doesn't include other user's contacts", async () => {
      await asUser(user1, () => upsertContact(user1Contact));

      await asUser(user2, async () => {
        expect(await resolver.contacts({})).toHaveLength(0);
      });
    });
  });

  describe('deleteContact', () => {
    it('deletes a contact', () =>
      asUser(user1, async () => {
        await upsertContact(user1Contact);
        await resolver.deleteContact({ addr: user1Contact });

        expect(
          await prisma.asUser.contact.findUnique({
            where: { userId_addr: { userId: user1.id, addr: user1Contact } },
          }),
        ).toBeNull();
      }));

    it("throws if the contact doesn't exist", () =>
      asUser(user1, async () => {
        await expect(resolver.deleteContact({ addr: user1Contact })).rejects.toThrow();
      }));
  });
});
