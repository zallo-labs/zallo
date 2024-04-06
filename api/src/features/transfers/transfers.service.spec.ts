import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { createMock } from '@golevelup/ts-jest';
import { DatabaseService } from '../database/database.service';
import { UserContext, asUser, getUserCtx } from '~/request/ctx';
import {
  ETH_ADDRESS,
  UAddress,
  UUID,
  ZERO_ADDR,
  asAddress,
  asChain,
  asUAddress,
  asUUID,
  randomDeploySalt,
} from 'lib';
import { randomAddress, randomLabel, randomUAddress, randomUser } from '~/util/test';
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
        implementation: randomAddress(),
        salt: randomDeploySalt(),
        upgradedAtBlock: 1n,
      })
      .unlessConflict()
      .id.run(db.client);

    return { id: asUUID(id), address };
  };

  let user1: UserContext;
  let account1: { id: UUID; address: UAddress };

  beforeEach(async () => {
    user1 = randomUser();
    account1 = await asUser(user1, createAccount);
  });

  const insert = (account = account1, params?: Partial<InsertShape<$Transfer>>) =>
    db.query(
      e.insert(e.Transfer, {
        account: e.select(e.Account, () => ({ filter_single: { id: account.id } })),
        systxHash: zeroHash,
        logIndex: 0,
        block: BigInt(Math.floor(Math.random() * 1000)),
        from: ZERO_ADDR,
        to: asAddress(account.address),
        tokenAddress: asUAddress(ETH_ADDRESS, asChain(account.address)),
        amount: e.decimal('1'),
        direction: [
          asAddress(account.address) === (params?.to ?? asAddress(account.address)) && 'In',
          asAddress(account.address) === (params?.from ?? ZERO_ADDR) && 'Out',
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

        expect((await service.select(account1.id, {})).map((t) => t.id)).toEqual(transfers);
      }));

    it("exclude transfers from accounts the user isn't a member of", async () => {
      await asUser(user1, () => insert(account1));

      await asUser(randomUser(), async () => {
        const account2 = await createAccount();
        const transfers = await Promise.all([insert(account2), insert(account2)]);

        expect((await service.select(account1.id, {})).map((t) => t.id)).toEqual(transfers);
      });
    });

    describe('filters', () => {
      it('direction', () =>
        asUser(user1, async () => {
          const inTransfer = await insert(account1, {
            from: ZERO_ADDR,
            to: asAddress(account1.address),
          });
          const outTransfer = await insert(account1, {
            from: asAddress(account1.address),
            to: ZERO_ADDR,
          });

          expect(
            (await service.select(account1.id, { direction: 'In' as any })).map((t) => t.id),
          ).toEqual([inTransfer]);

          expect(
            (await service.select(account1.id, { direction: 'Out' as any })).map((t) => t.id),
          ).toEqual([outTransfer]);
        }));

      it('internal', () =>
        asUser(user1, async () => {
          const externalTransfer = await insert();

          expect((await service.select(account1.id, { internal: false })).map((t) => t.id)).toEqual(
            [externalTransfer],
          );

          expect((await service.select(account1.id, { internal: true })).map((t) => t.id)).toEqual(
            [],
          );
        }));
    });
  });
});
