import { Test } from '@nestjs/testing';
import { ProposalsService, ProposeParams } from './proposals.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PRISMA_MOCK_PROVIDER } from '../util/prisma/prisma.service.mock';
import { PrismaService } from '../util/prisma/prisma.service';
import { asUser, UserContext } from '~/request/ctx';
import { randomAddress, randomUser } from '~/util/test';
import { asAddress, Address, CHAINS, randomDeploySalt, asHex } from 'lib';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import { ProviderService } from '../util/provider/provider.service';
import { connectAccount, connectOrCreateUser, connectPolicy } from '~/util/connect-or-create';
import { ExpoService } from '../util/expo/expo.service';
import { TransactionsService } from '../transactions/transactions.service';
import { Proposal } from '@prisma/client';
import { ProposalState } from './proposals.args';
import { PoliciesService } from '../policies/policies.service';
import assert from 'assert';

const randomSignature = () => asHex(randomBytes(32));

describe(ProposalsService.name, () => {
  let service: ProposalsService;
  let prisma: PrismaService;
  let provider: DeepMocked<ProviderService>;
  let expo: DeepMocked<ExpoService>;
  let policies: DeepMocked<PoliciesService>;
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
    policies = module.get(PoliciesService);
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
    to = account,
    ...params
  }: Partial<ProposeParams> = {}) => {
    // Account & policy
    const { policyStates: states } = await prisma.asUser.account.upsert({
      where: { id: account },
      create: {
        id: account,
        impl: account,
        deploySalt: randomDeploySalt(),
        name: '',
        policies: {
          create: {
            key: 0,
            name: '',
            states: {
              create: {
                approvers: { create: { user: connectOrCreateUser() } },
              },
            },
          },
        },
      },
      update: {},
      select: {
        policyStates: { select: { id: true, policyKey: true } },
      },
    });

    const initState = states[0];
    assert(initState);

    // Mark policy rules as active
    await prisma.asUser.policy.update({
      where: { accountId_key: { accountId: account, key: initState.policyKey } },
      data: { activeId: initState.id },
    });

    return service.propose({ account, to, ...params });
  };

  const approve = (id: string) => {
    provider.verifySignature.mockImplementationOnce(async () => true);
    return service.approve({ id, signature: randomSignature() });
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
        await propose({ signature: randomSignature() });
        expect(service.approve).toHaveBeenCalled();
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

        const proposals = await service.findMany({ accounts: [user1Account1] });
        expect(new Set(proposals.map((p) => p.accountId))).toEqual(new Set([user1Account1]));
      }));

    describe('states filters when', () => {
      let pending: Proposal;
      let pendingWithFailed: Proposal;
      let executing: Proposal;
      let executed: Proposal;

      beforeEach(() =>
        asUser(user1, async () => {
          pending = await propose();
          pendingWithFailed = await propose();
          executing = await propose();
          executed = await propose();

          await prisma.asSystem.transaction.create({
            data: {
              hash: hexlify(randomBytes(32)),
              proposal: { connect: { id: pendingWithFailed.id } },
              gasLimit: 0,
              response: {
                create: {
                  success: false,
                  response: hexlify(randomBytes(32)),
                  gasUsed: 0,
                  effectiveGasPrice: 0,
                },
              },
            },
          });

          await prisma.asSystem.transaction.create({
            data: {
              hash: hexlify(randomBytes(32)),
              proposal: { connect: { id: executing.id } },
              gasLimit: 0,
            },
          });

          await prisma.asSystem.transaction.create({
            data: {
              hash: hexlify(randomBytes(32)),
              proposal: { connect: { id: executed.id } },
              gasLimit: 0,
              response: {
                create: {
                  success: true,
                  response: hexlify(randomBytes(32)),
                  gasUsed: 0,
                  effectiveGasPrice: 0,
                },
              },
            },
          });
        }),
      );

      it('pending only shows pending proposals', () =>
        asUser(user1, async () => {
          const proposals = await service.findMany({ states: [ProposalState.Pending] });

          expect(new Set(proposals.map((p) => p.id))).toEqual(
            new Set([pending, pendingWithFailed].map((p) => p.id)),
          );
        }));

      it('executing only shows executing proposals', () =>
        asUser(user1, async () => {
          expect(await service.findMany({ states: [ProposalState.Executing] })).toEqual([
            executing,
          ]);
        }));

      it('executed only shows executed proposals', () =>
        asUser(user1, async () => {
          expect(await service.findMany({ states: [ProposalState.Executed] })).toEqual([executed]);
        }));

      it('shows all when all filters are applied', () =>
        asUser(user1, async () => {
          expect(await service.findMany({ states: Object.values(ProposalState) })).toHaveLength(4);
        }));
    });
  });

  describe('satisfiablePolicies', () => {
    it.todo('return satisfiable policies');

    it.todo('return satisfied policies');

    it.todo('set requiresUserAction correctly');
  });

  describe('approve', () => {
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

        provider.verifySignature.mockImplementationOnce(async () => false);
        await expect(service.approve({ id, signature: randomSignature() })).rejects.toThrow();
      }));

    // TODO: notification tests once it has been implemented
    // it("notifies active approvers that haven't approved", () =>
    //   asUser(user1, async () => {
    //     const { id, accountId } = await propose();

    //     const usersToNotify = [randomAddress(), randomAddress()];

    //     // Mark policy rules as active
    //     const policy: PolicyId = { account: asAddress(accountId), key: toPolicyKey(policyKey) };
    //     await prisma.asUser.policyRules.create({
    //       data: {
    //         account: connectAccount(policy.account),
    //         policy: connectPolicy(policy),
    //         activeStateOfPolicy: {
    //           connect: { accountId_key: { accountId, key: policyKey } },
    //         },
    //         approvers: {
    //           create: [user1.id, ...usersToNotify].map((user) => ({
    //             user: connectOrCreateUser(user),
    //           })),
    //         },
    //       },
    //     });

    //     await approve(id);

    //     expect(expo.chunkPushNotifications).toHaveBeenCalled();
    //   }));

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

        provider.verifySignature.mockImplementationOnce(async () => true);
        await service.approve({ id, signature: randomSignature() });

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
        provider.verifySignature.mockImplementationOnce(async () => true);

        await expect(
          service.approve({ id: "doesn't exist", signature: randomSignature() }),
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

    it("throws if the policy doesn't exist", () =>
      asUser(user1, async () => {
        await expect(service.delete({ id: hexlify(randomBytes(32)) })).rejects.toThrow();
      }));

    it("throws if the user isn't a member of the proposing account", async () => {
      const { id } = await asUser(user1, () => propose());

      await asUser(randomUser(), () => expect(service.delete({ id })).rejects.toThrow());
    });

    it('deletes policy that the proposal was going to create', () =>
      asUser(user1, async () => {
        const { id, accountId } = await propose();

        // Create policy with a single creation rule
        await prisma.asUser.policy.create({
          data: {
            account: connectAccount(accountId),
            key: 1,
            name: '',
            states: {
              create: {
                account: connectAccount(accountId),
                proposal: { connect: { id } },
              },
            },
          },
        });

        await service.delete({ id });

        // Expect all created policies to be deleted
        expect(policies.remove).toHaveBeenCalledTimes(1);
      }));

    it("policies being updated by proposal aren't deleted", () =>
      asUser(user1, async () => {
        const { id, accountId } = await propose();

        // Create policy with 2 states, only one of which is being proposed
        await prisma.asUser.policy.create({
          data: {
            account: connectAccount(asAddress(accountId)),
            key: 1,
            name: '',
            states: {
              create: [{}, { proposalId: id }],
            },
          },
        });

        await service.delete({ id });

        // Expect all created policies to be deleted
        expect(policies.remove).toHaveBeenCalledTimes(0);
      }));
  });
});
