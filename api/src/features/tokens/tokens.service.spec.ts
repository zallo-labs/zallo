import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { DatabaseService } from '../database/database.service';
import { createMock } from '@golevelup/ts-jest';
import { UserContext, asUser } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import e from '~/edgeql-js';
import { UpsertTokenInput } from './tokens.input';

describe('TokensService', () => {
  let service: TokensService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokensService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(TokensService);
    db = module.get(DatabaseService);
  });

  let user1: UserContext;
  beforeEach(async () => {
    user1 = randomUser();
    await db.query(e.insert(e.Approver, { address: user1.approver }));
  });

  const upsert = (input?: Partial<UpsertTokenInput>) => {
    return service.upsert({
      testnetAddress: randomAddress(),
      name: 'Test token',
      symbol: 'TEST',
      decimals: 8,
      units: [],
      ...input,
    });
  };

  describe('upsert', () => {
    it('insert a new token', async () =>
      asUser(user1, async () => {
        const { id } = await upsert();

        expect(await db.query(e.select(e.Token, () => ({ filter_single: { id } })).id)).toEqual(id);
      }));

    it('update existing token', async () =>
      asUser(user1, async () => {
        const testnetAddress = randomAddress();
        const { id } = await upsert({ testnetAddress, name: 'first' });
        await upsert({ testnetAddress, name: 'second' });

        expect(
          await db.query(e.select(e.Token, () => ({ filter_single: { id }, name: true })).name),
        ).toEqual('second');
      }));
  });

  describe('select', () => {
    it('include user tokens', async () =>
      asUser(user1, async () => {
        const { id } = await upsert();

        expect((await service.select(() => ({ id: true }))).find((t) => t.id === id)).toBeTruthy();
      }));

    it('include global tokens', async () => {
      const { id } = await db.query(
        e.insert(e.Token, {
          user: e.cast(e.User, e.set()),
          testnetAddress: randomAddress(),
          name: 'Test token',
          symbol: 'TEST',
          decimals: 8,
          units: [],
        }),
      );

      await asUser(user1, async () => {
        expect((await service.select(() => ({ id: true }))).find((t) => t.id === id)).toBeTruthy();
      });
    });

    it('prefer user token over global token', async () => {
      const testnetAddress = randomAddress();
      await db.query(
        e.insert(e.Token, {
          user: e.cast(e.User, e.set()),
          testnetAddress,
          name: 'Test token',
          symbol: 'TEST',
          decimals: 8,
          units: [],
        }),
      );

      await asUser(user1, async () => {
        await upsert({ testnetAddress, name: 'second' });

        service;
        expect(
          (await service.select(() => ({ testnetAddress: true, name: true })))
            .filter((t) => t.testnetAddress === testnetAddress)
            .map((t) => t.name),
        ).toEqual(['second']);
      });
    });
  });

  describe('remove', () => {
    it('removes token if existent', async () =>
      asUser(user1, async () => {
        const testnetAddress = randomAddress();
        const { id } = await upsert({ testnetAddress });
        await service.remove(testnetAddress);

        expect(await db.query(e.select(e.Token, () => ({ filter_single: { id } })))).toBeNull();
      }));

    it('not remove global token', async () => {
      const testnetAddress = randomAddress();
      const { id } = await db.query(
        e.insert(e.Token, {
          user: e.cast(e.User, e.set()),
          testnetAddress,
          name: 'Test token',
          symbol: 'TEST',
          decimals: 8,
          units: [],
        }),
      );

      asUser(user1, async () => {
        expect(await service.remove(testnetAddress)).toBeNull();

        expect((await db.query(e.select(e.Token, () => ({ filter_single: { id } }))))?.id).toEqual(
          id,
        );
      });
    });
  });
});
