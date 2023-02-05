import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { PrismaService } from '../util/prisma/prisma.service';
import { QuorumsService } from './quorums.service';
import { Address, QuorumGuid, randomDeploySalt, randomTxSalt, toQuorumKey } from 'lib';
import { asUser, UserContext } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { ProposalsService } from '../proposals/proposals.service';
import { connectAccount, connectOrCreateUser, connectQuorum } from '~/util/connect-or-create';

describe(QuorumsService.name, () => {
  let service: QuorumsService;
  let prisma: PrismaService;
  let proposals: DeepMocked<ProposalsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [QuorumsService, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(QuorumsService);
    prisma = module.get(PrismaService);
    proposals = module.get(ProposalsService);
  });

  let user1Account: Address;
  let user1: UserContext;

  const create = async () => {
    const quorum: QuorumGuid = {
      account: user1Account,
      key: toQuorumKey(1),
    };

    await prisma.asUser.account.create({
      data: {
        id: quorum.account,
        deploySalt: randomDeploySalt(),
        impl: quorum.account,
        name: '',
      },
    });

    proposals.propose.mockImplementation(async () =>
      prisma.asUser.proposal.create({
        data: {
          id: hexlify(randomBytes(32)),
          account: connectAccount(user1Account),
          quorum: connectQuorum(quorum),
          proposer: connectOrCreateUser(user1.id),
          to: user1Account,
          salt: randomTxSalt(),
        },
      }),
    );

    await service.create(
      {
        account: quorum.account,
        proposingQuorumKey: quorum.key,
        approvers: new Set(),
      },
      { select: null },
    );

    return quorum;
  };

  beforeEach(() => {
    user1Account = randomAddress();
    user1 = {
      id: randomAddress(),
      accounts: new Set([user1Account]),
    };
  });

  describe('create', () => {
    it('create quorum', () =>
      asUser(user1, async () => {
        const quorum = await create();

        expect(
          await service.findUnique({
            where: {
              accountId_key: {
                accountId: quorum.account,
                key: quorum.key,
              },
            },
          }),
        ).toBeTruthy();
      }));

    it('creates state', () =>
      asUser(user1, async () => {
        await create();
        expect(await prisma.asUser.quorumState.count()).toEqual(1);
      }));

    it('proposes an upsert', () =>
      asUser(user1, async () => {
        await create();
        expect(proposals.propose).toHaveBeenCalledTimes(1);
      }));

    it("throws if the user isn't a member of the account", () =>
      asUser(randomUser(), async () => {
        await expect(create()).rejects.toThrow();
      }));
  });

  describe('update', () => {
    it('creates state', () =>
      asUser(user1, async () => {
        const quorum = await create();
        await service.update({ ...quorum, approvers: new Set() });

        expect(await prisma.asUser.quorumState.count()).toEqual(2);
      }));

    it('proposes an upsert', () =>
      asUser(user1, async () => {
        const quorum = await create();

        expect(proposals.propose).toBeCalledTimes(1);
        await service.update({ ...quorum, approvers: new Set() });
      }));

    it("throws if the quorum doesn't exist", () =>
      asUser(user1, async () => {
        await expect(
          service.update({ account: user1Account, key: toQuorumKey(1), approvers: new Set() }),
        ).rejects.toThrow();
      }));
  });

  describe('updateMetadata', () => {
    it('updates name', () =>
      asUser(user1, async () => {
        const quorum = await create();

        const newName = 'new';
        expect((await service.updateMetadata({ ...quorum, name: newName })).name).toEqual(newName);
      }));

    it("throws if the user isn't a member of the account", async () => {
      const quorum = await asUser(user1, create);

      await asUser(randomUser(), () =>
        expect(service.updateMetadata({ ...quorum, name: '' })).rejects.toThrow(),
      );
    });
  });

  describe('remove', () => {
    it('creates a removed state', () =>
      asUser(user1, async () => {
        const quorum = await create();
        await service.remove(quorum);

        expect(await prisma.asUser.quorumState.count({ where: { isRemoved: true } })).toEqual(1);
      }));

    it('proposes a remove if the quorum is active', () =>
      asUser(user1, async () => {
        const quorum = await create();

        // Mark quorum state as active
        const { id } = await prisma.asUser.quorumState.findFirstOrThrow();
        await prisma.asUser.quorum.update({
          where: {
            accountId_key: {
              accountId: quorum.account,
              key: quorum.key,
            },
          },
          data: { activeStateId: id },
        });

        expect(proposals.propose).toHaveBeenCalledTimes(1);
        await service.remove(quorum);
        expect(proposals.propose).toHaveBeenCalledTimes(2);
      }));

    it('removes without a proposal if the quorum is inactive', () =>
      asUser(user1, async () => {
        const quorum = await create();

        expect(proposals.propose).toHaveBeenCalledTimes(1);
        await service.remove(quorum);
        expect(proposals.propose).toHaveBeenCalledTimes(1);
      }));

    it("throws if the user isn't a member of the account", async () => {
      const quorum = await asUser(user1, create);

      await asUser(randomUser(), () => expect(service.remove(quorum)).rejects.toThrow());
    });
  });
});
