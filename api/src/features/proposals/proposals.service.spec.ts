import { Test } from '@nestjs/testing';
import { ProposalsService, ProposeParams } from './proposals.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { PrismaService } from '../util/prisma/prisma.service';
import { asUser, getUserId, UserContext } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import {
  address,
  Address,
  CHAINS,
  QuorumGuid,
  randomDeploySalt,
  randomQuorumKey,
  toQuorumKey,
} from 'lib';
import { QuorumsService } from '../quorums/quorums.service';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { ProviderService } from '../util/provider/provider.service';
import { connectAccount, connectOrCreateUser, connectQuorum } from '~/util/connect-or-create';
import { ExpoService } from '../util/expo/expo.service';
import { TransactionsService } from '../transactions/transactions.service';

describe(ProposalsService.name, () => {
  let service: ProposalsService;
  let prisma: PrismaService;
  let provider: DeepMocked<ProviderService>;
  let expo: DeepMocked<ExpoService>;
  let quorums: DeepMocked<QuorumsService>;
  let transactions: DeepMocked<TransactionsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProposalsService, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(ProposalsService);
    prisma = module.get(PrismaService);
    provider = module.get(ProviderService);
    expo = module.get(ExpoService);
    quorums = module.get(QuorumsService);
    transactions = module.get(TransactionsService);
  });

  let user1Account1: Address;
  let user1Account2: Address;
  let user1: UserContext;

  beforeEach(async () => {
    user1Account1 = randomAddress();
    user1Account2 = randomAddress();
    user1 = {
      id: randomAddress(),
      accounts: new Set([user1Account1, user1Account2]),
    };

    provider.getNetwork.mockImplementation(async () => ({
      chainId: CHAINS.local.id,
      name: CHAINS.local.name,
    }));

    transactions.tryExecute.mockImplementationOnce(async () => undefined);
  });

  const propose = async ({
    account = user1Account1,
    quorumKey = toQuorumKey(1),
    to = account,
    ...params
  }: Partial<ProposeParams> = {}) => {
    // Account & quorum
    await prisma.asUser.account.upsert({
      where: { id: account },
      create: {
        id: account,
        impl: account,
        deploySalt: randomDeploySalt(),
        name: '',
        quorums: {
          create: {
            key: quorumKey,
            name: '',
          },
        },
      },
      update: {},
    });

    // User
    const userId = getUserId();
    await prisma.asUser.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
      select: { id: true },
    });

    return service.propose({ account, quorumKey, to, ...params });
  };

  describe('propose', () => {
    it('creates a proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        expect(await prisma.asUser.proposal.findUnique({ where: { id } })).toBeTruthy();
      }));

    it('approves proposal if signature was provided', () =>
      asUser(user1, async () => {
        jest.spyOn(service, 'approve').mockImplementationOnce(async () => ({ id: '' } as any));
        await propose({ signature: '0xMySignature' });
        expect(service.approve).toHaveBeenCalled();
      }));

    it("uses default quorum if one isn't provided", () =>
      asUser(user1, async () => {
        quorums.getDefaultQuorum.mockImplementationOnce(async () => ({
          account: user1Account1,
          key: toQuorumKey(1),
        }));

        await expect(propose({ quorumKey: undefined })).resolves.not.toThrow();
      }));
  });

  describe('findUnqiue', () => {
    // Prisma passthrough, no need fo basic tests

    it("returns null if the proposal if from an account the user isn't a member of", async () => {
      const { id } = await asUser(user1, () => propose());

      await asUser(randomUser(), async () => {
        expect(await service.findUnique({ where: { id } })).toBeNull();
      });
    });
  });

  describe('findMany', () => {
    it('returns proposals', () =>
      asUser(user1, async () => {
        const { id: id1 } = await propose();
        const { id: id2 } = await propose();

        const proposals = (await service.findMany()).map((p) => p.id);
        expect(new Set(proposals)).toEqual(new Set([id1, id2]));
      }));

    it("doesn't return proposals from accounts the user's a member of", async () => {
      await asUser(user1, () => propose());

      await asUser(randomUser(), async () => {
        expect(await service.findMany()).toHaveLength(0);
      });
    });

    it('only returns proposals from accounts (if explicity provided)', () =>
      asUser(user1, async () => {
        await propose({ account: user1Account1 });
        await propose({ account: user1Account2 });

        const proposals = await service.findMany({ accounts: new Set([user1Account1]) });
        expect(new Set(proposals.map((p) => p.accountId))).toEqual(new Set([user1Account1]));
      }));

    it.todo('filters by states');
  });

  describe('approve', () => {
    const approve = (id: string) => {
      provider.isValidSignature.mockImplementationOnce(async () => true);
      return service.approve({ id, signature: hexlify(randomBytes(32)) });
    };

    it('creates approval', () =>
      asUser(user1, async () => {
        const { id } = await propose();

        await approve(id);

        expect(
          await prisma.asUser.approval.findUnique({
            where: { proposalId_userId: { proposalId: id, userId: user1.id } },
          }),
        ).toBeTruthy();
      }));

    it("throws if the proposal doesn't exist", () =>
      asUser(user1, async () => {
        await expect(approve(hexlify(randomBytes(32)))).rejects.toThrow();
      }));

    it("throws if the signature isn't valid (from the user for that proposal)", () =>
      asUser(user1, async () => {
        const { id } = await propose();

        provider.isValidSignature.mockImplementationOnce(async () => false);
        await expect(
          service.approve({ id, signature: hexlify(randomBytes(32)) }),
        ).rejects.toThrow();
      }));

    it("notifies active approvers that haven't approved", () =>
      asUser(user1, async () => {
        const { id, accountId, quorumKey } = await propose();

        const usersToNotify = [randomAddress(), randomAddress()];

        // Mark quorum state as active
        const quorum: QuorumGuid = { account: address(accountId), key: toQuorumKey(quorumKey) };
        await prisma.asUser.quorumState.create({
          data: {
            account: connectAccount(quorum.account),
            quorum: connectQuorum(quorum),
            activeStateOfQuorum: {
              connect: { accountId_key: { accountId, key: quorumKey } },
            },
            approvers: {
              create: [user1.id, ...usersToNotify].map((user) => ({
                user: connectOrCreateUser(user),
              })),
            },
          },
        });

        await approve(id);

        expect(expo.chunkPushNotifications).toHaveBeenCalled();
      }));

    it('tries to execute transaction', () =>
      asUser(user1, async () => {
        const { id } = await propose();

        await approve(id);
        expect(transactions.tryExecute).toHaveBeenCalled();
      }));
  });

  describe('reject', () => {
    it('creates rejection', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        await service.reject({ id });

        expect(
          await prisma.asUser.approval.findUnique({
            where: { proposalId_userId: { proposalId: id, userId: user1.id } },
          }),
        ).toBeTruthy();
      }));

    it('creates rejection to proposal when the user had previously approved', () =>
      asUser(user1, async () => {
        const { id } = await propose();

        provider.isValidSignature.mockImplementationOnce(async () => true);
        await service.approve({ id, signature: hexlify(randomBytes(32)) });

        await service.reject({ id });

        expect(
          (
            await prisma.asUser.approval.findUnique({
              where: { proposalId_userId: { proposalId: id, userId: user1.id } },
            })
          )?.signature,
        ).toBe(null);
      }));

    it("throws if the proposal doesn't exist", () =>
      asUser(user1, async () => {
        provider.isValidSignature.mockImplementationOnce(async () => true);

        await expect(
          service.approve({ id: "doesn't exist", signature: hexlify(randomBytes(32)) }),
        ).rejects.toThrow();
      }));
  });

  describe('delete', () => {
    it('deletes proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        await service.delete({ id });

        expect(await service.findUnique({ where: { id } })).toBeNull();
      }));

    it("throws if the quorum doesn't exist", () =>
      asUser(user1, async () => {
        await expect(service.delete({ id: hexlify(randomBytes(32)) })).rejects.toThrow();
      }));

    it("throws if the user isn't a member of the proposing account", async () => {
      const { id } = await asUser(user1, () => propose());

      await asUser(randomUser(), () => expect(service.delete({ id })).rejects.toThrow());
    });

    it('deletes quorums that the proposal was going to create', () =>
      asUser(user1, async () => {
        const { id, accountId } = await propose();

        // Create quorum with 1 state - the state being proposed
        await prisma.asUser.quorum.create({
          data: {
            account: connectAccount(address(accountId)),
            key: randomQuorumKey(),
            name: '',
            states: {
              create: {
                proposalId: id,
              },
            },
          },
        });

        await service.delete({ id });

        // Expect all created quorums to be deleted
        expect(quorums.remove).toHaveBeenCalledTimes(1);
      }));

    it("quorums being updated by proposal aren't deleted", () =>
      asUser(user1, async () => {
        const { id, accountId } = await propose();

        // Create quorum with 2 states, only one of which is being proposed
        await prisma.asUser.quorum.create({
          data: {
            account: connectAccount(address(accountId)),
            key: randomQuorumKey(),
            name: '',
            states: {
              create: [{}, { proposalId: id }],
            },
          },
        });

        await service.delete({ id });

        // Expect all created quorums to be deleted
        expect(quorums.remove).toHaveBeenCalledTimes(0);
      }));
  });
});
