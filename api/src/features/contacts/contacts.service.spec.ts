import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Address, randomDeploySalt } from 'lib';
import { asUser, getApprover, getUserCtx, UserContext } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import { DatabaseService } from '../database/database.service';
import { ContactsService, uniqueContact } from './contacts.service';
import e from '~/edgeql-js';
import { v1 as uuid1 } from 'uuid';

describe(ContactsService.name, () => {
  let service: ContactsService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(ContactsService);
    db = module.get(DatabaseService);
  });

  let user1: UserContext;
  let user1Contact: Address;

  beforeEach(async () => {
    user1 = randomUser();
    user1Contact = randomAddress();

    await asUser(user1, () =>
      db.query(e.insert(e.Approver, { address: user1.approver }).unlessConflict()),
    );
  });

  const upsertContact = (address: Address = randomAddress(), label = `${address} contact`) => {
    return service.upsert({ label, address });
  };

  describe('upsert', () => {
    it("creates a contact if the contact didn't already exist", () =>
      asUser(user1, async () => {
        const id = await upsertContact();

        expect(await db.query(e.select(e.Contact, uniqueContact(id)))).toBeTruthy();
      }));

    it('updates a contact if it already existed', () =>
      asUser(user1, async () => {
        const newLabel = 'b';
        await upsertContact(user1Contact, 'a');
        await upsertContact(user1Contact, newLabel);

        expect(
          await db.query(
            e.select(e.Contact, (c) => ({
              ...uniqueContact(user1Contact)(c),
              label: true,
            })).label,
          ),
        ).toEqual(newLabel);
      }));

    it('only allow unique names (within the scope of a user)', () =>
      asUser(user1, async () => {
        const name = 'a';
        await upsertContact(user1Contact, name);
        await expect(upsertContact(randomAddress(), name)).rejects.toThrow();
      }));
  });

  describe('selectUnique', () => {
    it('returns contact for user', () =>
      asUser(user1, async () => {
        await upsertContact(user1Contact);
        expect(await service.selectUnique(user1Contact)).toBeTruthy();
      }));

    it("returns null if the contact doesn't exist", () =>
      asUser(user1, async () => {
        expect(await service.selectUnique(user1Contact)).toBeNull();
      }));

    it("doesn't return contact of another user", async () => {
      await asUser(user1, () => upsertContact(user1Contact));

      await asUser(randomUser(), async () =>
        expect(await service.selectUnique(user1Contact)).toBeNull(),
      );
    });
  });

  describe('select', () => {
    it("returns all user's contacts", () =>
      asUser(user1, async () => {
        const expectedContacts = new Set([user1Contact, randomAddress()]);
        await Promise.all([...expectedContacts].map((contact) => upsertContact(contact)));

        const contacts = (await service.select(() => ({ address: true }))).map((c) => c.address);
        expect(new Set(contacts)).toEqual(expectedContacts);
      }));

    it("includes user's accounts", () =>
      asUser(user1, async () => {
        const account = randomAddress();

        const accountId = uuid1();
        getUserCtx().accounts.push(accountId);
        await db.query(
          e.insert(e.Account, {
            id: accountId,
            address: account,
            name: 'Test account',
            implementation: account,
            isActive: false,
            salt: randomDeploySalt(),
          }),
        );

        const contacts = await service.select(() => ({ address: true }));
        expect(contacts.map((c) => c.address)).toEqual([account]);
      }));

    it("doesn't include other user's contacts", async () => {
      await asUser(user1, () => upsertContact(user1Contact));

      await asUser(randomUser(), async () => {
        expect(await service.select()).toHaveLength(0);
      });
    });
  });

  describe('delete', () => {
    it('deletes a contact', () =>
      asUser(user1, async () => {
        await upsertContact(user1Contact);
        await service.delete(user1Contact);

        expect(await service.selectUnique(user1Contact)).toBeNull();
      }));

    it("returns null if the contact doesn't exist", () =>
      asUser(user1, async () => {
        await expect(await service.delete(user1Contact)).toEqual(null);
      }));
  });
});
