import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { PrismaService } from '../util/prisma/prisma.service';
import { PoliciesService } from './policies.service';
import { Address, asPolicyKey, PolicyGuid, randomDeploySalt } from 'lib';
import { asUser, UserContext } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { ProposalsService } from '../proposals/proposals.service';
import { connectAccount, connectOrCreateUser } from '~/util/connect-or-create';

describe(PoliciesService.name, () => {
  let service: PoliciesService;
  let prisma: PrismaService;
  let proposals: DeepMocked<ProposalsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PoliciesService, PRISMA_MOCK_PROVIDER],
    })
      .useMocker(createMock)
      .compile();

    service = module.get(PoliciesService);
    prisma = module.get(PrismaService);
    proposals = module.get(ProposalsService);
  });

  let user1Account: Address;
  let user1: UserContext;

  const create = async ({ active }: { active?: boolean } = {}) => {
    const account = user1Account;

    await prisma.asUser.account.create({
      data: {
        id: account,
        deploySalt: randomDeploySalt(),
        impl: account,
        name: '',
      },
    });

    proposals.propose.mockImplementation(async () =>
      prisma.asUser.proposal.create({
        data: {
          id: hexlify(randomBytes(32)),
          account: connectAccount(account),
          proposer: connectOrCreateUser(user1.id),
          to: account,
          nonce: 0,
        },
      }),
    );

    const { key } = await service.create(
      {
        account,
        rules: { approvers: [] },
      },
      { select: null },
    );

    if (active) {
      // Mark policy state as active
      await prisma.asUser.policy.update({
        where: {
          accountId_key: {
            accountId: account,
            key,
          },
        },
        data: { activeId: (await prisma.asUser.policyRules.findFirstOrThrow()).id },
      });
    }

    return { account, key: asPolicyKey(key) } satisfies PolicyGuid;
  };

  beforeEach(() => {
    user1Account = randomAddress();
    user1 = {
      id: randomAddress(),
      accounts: new Set([user1Account]),
    };
  });

  describe('create', () => {
    it('create policy', () =>
      asUser(user1, async () => {
        const policy = await create();

        expect(
          await service.findUnique({
            where: {
              accountId_key: {
                accountId: policy.account,
                key: policy.key,
              },
            },
          }),
        ).toBeTruthy();
      }));

    it('creates state', () =>
      asUser(user1, async () => {
        await create();
        expect(await prisma.asUser.policyRules.count()).toEqual(1);
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
    it('updates name', () =>
      asUser(user1, async () => {
        const policy = await create();

        const newName = 'new';
        expect((await service.update({ ...policy, name: newName })).name).toEqual(newName);
      }));

    it('creates state', () =>
      asUser(user1, async () => {
        const policy = await create();
        await service.update({ ...policy, rules: { approvers: [] } });

        expect(await prisma.asUser.policyRules.count()).toEqual(2);
      }));

    it('propose', () =>
      asUser(user1, async () => {
        const policy = await create();

        expect(proposals.propose).toBeCalledTimes(1);
        await service.update({ ...policy, rules: { approvers: [] } });
      }));

    it("throws if the user isn't a member of the account", async () => {
      const policy = await asUser(user1, create);

      await asUser(randomUser(), () =>
        expect(service.update({ ...policy, name: '' })).rejects.toThrow(),
      );
    });

    it("throws if the policy doesn't exist", () =>
      asUser(user1, async () => {
        await expect(
          service.update({
            account: user1Account,
            key: asPolicyKey(10),
            rules: { approvers: [] },
          }),
        ).rejects.toThrow();
      }));
  });

  describe('remove', () => {
    it('creates a removed state', () =>
      asUser(user1, async () => {
        const policy = await create();
        await service.remove(policy);

        expect(await prisma.asUser.policyRules.count({ where: { isRemoved: true } })).toEqual(1);
      }));

    it('proposes a remove if the policy is active', () =>
      asUser(user1, async () => {
        const policy = await create({ active: true });

        expect(proposals.propose).toHaveBeenCalledTimes(1);
        await service.remove(policy);
        expect(proposals.propose).toHaveBeenCalledTimes(2);
      }));

    it('removes without a proposal if the policy is inactive', () =>
      asUser(user1, async () => {
        const policy = await create();

        expect(proposals.propose).toHaveBeenCalledTimes(1);
        await service.remove(policy);
        expect(proposals.propose).toHaveBeenCalledTimes(1);
      }));

    it("throws if the user isn't a member of the account", async () => {
      const policy = await asUser(user1, create);

      await asUser(randomUser(), () => expect(service.remove(policy)).rejects.toThrow());
    });
  });

  describe('delete', () => {
    it('should throw if policy is active', () =>
      asUser(user1, async () => {
        const policy = await create({ active: true });

        await expect(
          prisma.asUser.policy.delete({
            where: { accountId_key: { accountId: policy.account, key: policy.key } },
          }),
        ).rejects.toThrow();
      }));
  });
});
