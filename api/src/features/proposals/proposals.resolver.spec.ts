import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { Address, randomDeploySalt, randomQuorumKey, randomTxSalt } from 'lib';
import { asUser, getUserId, UserContext } from '~/request/ctx';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { randomAddress } from '~/util/test';
import { PrismaService } from '../util/prisma/prisma.service';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { ProposeArgs } from './proposals.args';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';

describe(ProposalsResolver.name, () => {
  let resolver: ProposalsResolver;
  let prisma: PrismaService;
  let service: DeepMocked<ProposalsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposalsResolver, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    resolver = module.get(ProposalsResolver);
    prisma = module.get(PrismaService);
    service = module.get(ProposalsService);
  });

  let user1: UserContext;
  let user1Account1: Address;
  let user1Account2: Address;
  let user2: UserContext;

  const propose = (
    {
      account = user1Account1,
      quorumKey = randomQuorumKey(),
      to = account,
      salt = randomTxSalt(),
      ...args
    }: Partial<ProposeArgs> = {},
    id = hexlify(randomBytes(32)),
  ) => {
    service.propose.mockImplementationOnce(async () => {
      const acc: Prisma.AccountCreateNestedOneWithoutProposalsInput = {
        connectOrCreate: {
          where: { id: account },
          create: {
            id: account,
            impl: account,
            deploySalt: randomDeploySalt(),
            name: '',
          },
        },
      };

      return prisma.asUser.proposal.create({
        data: {
          id,
          account: acc,
          quorum: { create: { account: acc, key: quorumKey, name: '' } },
          proposer: connectOrCreateUser(),
          to,
          salt,
        },
      });
    });

    service.approve.mockImplementationOnce(async () => ({
      id,
      accountId: account,
      proposerId: getUserId(),
      quorumKey,
      to,
      value: null,
      data: null,
      salt,
      gasLimit: null,
      createdAt: new Date(),
    }));

    return resolver.propose({
      account,
      quorumKey,
      to,
      ...args,
    });
  };

  beforeEach(async () => {
    user1Account1 = randomAddress();
    user1Account2 = randomAddress();
    user1 = {
      id: randomAddress(),
      accounts: new Set([user1Account1, user1Account2]),
    };
    user2 = { id: randomAddress(), accounts: new Set() };
  });

  describe('propose', () => {
    it('creates a proposal', () =>
      asUser(user1, async () => {
        await propose();
        expect(service.propose).toBeCalled();
      }));

    it('approves proposal if signature was provided', () =>
      asUser(user1, async () => {
        await propose({ signature: '0xMySignature' });
        expect(service.approve).toBeCalled();
      }));
  });

  describe('proposal', () => {
    it('returns proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        expect(await resolver.proposal({ id })).toBeTruthy();
      }));

    it("returns null if the proposal doesn't exist", () =>
      asUser(user1, async () => {
        expect(await resolver.proposal({ id: hexlify(randomBytes(32)) })).toBeNull();
      }));

    it("returns null if the proposal if from an account the user isn't a member of", async () => {
      const { id } = await asUser(user1, () => propose());

      await asUser(user2, async () => {
        expect(await resolver.proposal({ id })).toBeNull();
      });
    });
  });

  describe('proposals', () => {
    it('returns proposals', () =>
      asUser(user1, async () => {
        const { id: id1 } = await propose();
        const { id: id2 } = await propose();

        const proposals = (await resolver.proposals({})).map((p) => p.id);
        expect(new Set(proposals)).toEqual(new Set([id1, id2]));
      }));

    it("doesn't return proposals from accounts the user's a member of", async () => {
      await asUser(user1, () => propose());

      await asUser(user2, async () => {
        expect(await resolver.proposals({})).toHaveLength(0);
      });
    });

    it('only returns proposals from accounts (if explicity provided)', () =>
      asUser(user1, async () => {
        await Promise.all([
          propose({ account: user1Account1 }),
          propose({ account: user1Account2 }),
        ]);

        const proposals = await resolver.proposals({ accounts: new Set([user1Account1]) });
        expect(new Set(proposals.map((p) => p.accountId))).toEqual(new Set([user1Account1]));
      }));

    it.todo('filters by states');
  });

  describe('approve', () => {
    it('approves proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        await resolver.approve({ id, signature: '0xsignature' });
        expect(service.approve).toBeCalled();
      }));
  });

  describe('reject', () => {
    it('rejects proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        await resolver.reject({ id });
        expect(service.reject).toBeCalled();
      }));
  });

  describe('removeProposal', () => {
    it('deletes proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        await resolver.removeProposal({ id });
        expect(await prisma.asUser.proposal.findUnique({ where: { id } })).toBeNull();
      }));

    it("throws if the proposal doesn't exist", () =>
      asUser(user1, async () => {
        await expect(resolver.removeProposal({ id: "doesn't exist" })).rejects.toThrow();
      }));

    it("throws if the user doesn't belong to the proposing quorum", async () => {
      const { id } = await asUser(user1, () => propose());
      await expect(resolver.removeProposal({ id })).rejects.toThrow();
    });
  });
});
