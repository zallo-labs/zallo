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
  let user1Account: Address;

  const propose = (
    {
      account = user1Account,
      quorumKey = randomQuorumKey(),
      to = account,
      salt = randomTxSalt(),
      ...args
    }: Partial<ProposeArgs> = {},
    id = hexlify(randomBytes(32)),
  ) => {
    service.create.mockImplementationOnce(async () => {
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
    user1Account = randomAddress();
    user1 = {
      id: randomAddress(),
      accounts: new Set([user1Account]),
    };
  });

  describe('propose', () => {
    it('creates a proposal', () =>
      asUser(user1, async () => {
        await propose();
        expect(service.create).toBeCalled();
      }));

    it('approves proposal if signature was provided', () =>
      asUser(user1, async () => {
        await propose({ signature: '0xMySignature' });
        expect(service.approve).toBeCalled();
      }));
  });

  describe('proposal', () => {
    it.only('returns proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        expect(await resolver.proposal({ id })).toBeTruthy();
      }));

    it.todo("returns null if the proposal doesn't exist");

    it.todo("returns null if the proposal if from an account the user isn't a member of");
  });

  describe('proposals', () => {
    it.todo('returns proposals');

    it.todo("doesn't return proposals from accounts the user's a member of");

    it.todo('only returns proposals from accounts if explicity provided');

    it.todo('filters by states');
  });

  describe('approve', () => {
    it.todo('adds approval to proposal');

    it.todo("throws if proposal doesn't exist");

    it.todo("throws if the user doesn't belong to the proposing quorum");

    it.todo("throws if the signature isn't valid (from the user & for the proposal)");
  });

  describe('reject', () => {
    it.todo('adds rejection to proposal');

    it.todo('adds rejection to proposal when the user had previously approved');

    it.todo("throws if the proposal doesn't exist");

    it.todo("throws if the user doesn't belong to the proposing quorum");
  });

  describe('removeProposal', () => {
    it.todo('deletes proposal');

    it.todo("throws if the proposal doesn't exist");

    it.todo("throws if the user doesn't belong to the proposing quorum");
  });

  describe('requestApproval', () => {
    // TODO: consider removing, and make notifications automatic on proposal?
  });
});
