import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { createMock } from '@golevelup/ts-jest';
import { DatabaseService } from '../database/database.service';
import { UserContext, asUser, getUserCtx } from '~/request/ctx';
import { UAddress, ZERO_ADDR, randomDeploySalt } from 'lib';
import { randomLabel, randomUAddress, randomUser } from '~/util/test';
import e from '~/edgeql-js';
import { v1 as uuidv1 } from 'uuid';
import { InsertShape } from '~/edgeql-js/insert';
import { $Transfer } from '~/edgeql-js/modules/default';
import { zeroHash } from 'viem';

describe(TransfersService.name, () => {
  let service: TransfersService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransfersService, DatabaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(TransfersService);
    db = module.get(DatabaseService);
  });

  const createAccount = async (address = randomUAddress()) => {
    const id = uuidv1();
    getUserCtx().accounts.push({ id, address });

    await e
      .insert(e.Account, {
        id,
        address,
        label: randomLabel(),
        implementation: address,
        salt: randomDeploySalt(),
        isActive: true,
      })
      .unlessConflict()
      .id.run(db.client);

    return { id, address };
  };

  let user1: UserContext;
  let account1: UAddress;

  beforeEach(async () => {
    user1 = randomUser();
    account1 = (await asUser(user1, createAccount)).address;
  });

  const insert = (account = account1, params?: Partial<InsertShape<$Transfer>>) =>
    db.query(
      e.insert(e.Transfer, {
        account: e.select(e.Account, () => ({ filter_single: { address: account } })),
        transactionHash: zeroHash,
        logIndex: 0,
        block: BigInt(Math.floor(Math.random() * 1000)),
        from: ZERO_ADDR,
        to: account,
        tokenAddress: ZERO_ADDR,
        amount: 1n,
        direction: [
          account === (params?.to ?? account) && 'In',
          account === (params?.from ?? ZERO_ADDR) && 'Out',
        ].filter(Boolean) as ['Out'],
        ...params,
      }).id,
    );

  describe('selectUnique', () => {
    it('return transfer', () =>
      asUser(user1, async () => {
        const transfer = await insert();

        expect((await service.selectUnique(transfer))?.id).toEqual(transfer);
      }));

    it("return null if user isn't a member of the account", async () => {
      const transfer = await asUser(user1, insert);

      await asUser(randomUser(), async () => {
        expect(await service.selectUnique(transfer)).toEqual(null);
      });
    });
  });

  describe('select', () => {
    it('returns transfers', () =>
      asUser(user1, async () => {
        const transfers = await Promise.all([insert(), insert()]);

        expect((await service.select({})).map((t) => t.id)).toEqual(transfers);
      }));

    it("exclude transfers from accounts the user isn't a member of", async () => {
      await asUser(user1, () => insert(account1));

      await asUser(randomUser(), async () => {
        const account2 = (await createAccount()).address;
        const transfers = await Promise.all([insert(account2), insert(account2)]);

        expect((await service.select({})).map((t) => t.id)).toEqual(transfers);
      });
    });

    describe('filters', () => {
      it('accounts', () =>
        asUser(user1, async () => {
          const account2 = (await createAccount()).address;

          const [a1Transfer, a2Transfer] = await Promise.all([insert(account1), insert(account2)]);

          expect((await service.select({ accounts: [account1] })).map((t) => t.id)).toEqual([
            a1Transfer,
          ]);

          expect(
            (await service.select({ accounts: [account1, account2] })).map((t) => t.id),
          ).toEqual([a1Transfer, a2Transfer]);
        }));

      it('direction', () =>
        asUser(user1, async () => {
          const inTransfer = await insert(account1, { from: ZERO_ADDR, to: account1 });
          const outTransfer = await insert(account1, { from: account1, to: ZERO_ADDR });

          expect((await service.select({ direction: 'In' as any })).map((t) => t.id)).toEqual([
            inTransfer,
          ]);

          expect((await service.select({ direction: 'Out' as any })).map((t) => t.id)).toEqual([
            outTransfer,
          ]);
        }));

      it('internal', () =>
        asUser(user1, async () => {
          const externalTransfer = await insert();

          expect((await service.select({ internal: false })).map((t) => t.id)).toEqual([
            externalTransfer,
          ]);

          expect((await service.select({ internal: true })).map((t) => t.id)).toEqual([]);
        }));
    });
  });
});
