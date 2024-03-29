import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { asUser, getApprover, getUserCtx, UserContext } from '~/request/ctx';
import {
  DeepPartial,
  randomAddress,
  randomHash,
  randomLabel,
  randomUAddress,
  randomUser,
} from '~/util/test';
import { randomDeploySalt, Hex, UAddress, ZERO_ADDR, asUUID } from 'lib';
import { Network, NetworksService } from '../util/networks/networks.service';
import { ProposeTransactionInput } from './transactions.input';
import { DatabaseService } from '../database/database.service';
import { TransactionsService, selectTransaction } from './transactions.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { selectPolicy } from '../policies/policies.util';
import { v4 as uuid } from 'uuid';
import { BullModule, getFlowProducerToken, getQueueToken } from '@nestjs/bullmq';
import { SimulationsQueue } from '~/features/simulations/simulations.worker';
import { ExecutionsQueue } from '~/features/transactions/executions.worker';
import { FLOW_PRODUCER, registerFlowsProducer } from '../util/bull/bull.util';
import { CHAINS } from 'chains';
import { PaymastersService } from '~/features/paymasters/paymasters.service';
import Decimal from 'decimal.js';
import { PoliciesService } from '../policies/policies.service';

const signature = '0x1234' as Hex;

describe(TransactionsService.name, () => {
  let service: TransactionsService;
  let db: DatabaseService;
  let networks: DeepMocked<NetworksService>;
  let paymasters: DeepMocked<PaymastersService>;
  let policies: DeepMocked<PoliciesService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue(SimulationsQueue, ExecutionsQueue),
        registerFlowsProducer(),
      ],
      providers: [TransactionsService, DatabaseService],
    })
      .overrideProvider(getQueueToken(SimulationsQueue.name))
      .useValue(createMock())
      .overrideProvider(getQueueToken(ExecutionsQueue.name))
      .useValue(createMock())
      .overrideProvider(getFlowProducerToken(FLOW_PRODUCER))
      .useValue(createMock())
      .useMocker(createMock)
      .compile();

    service = module.get(TransactionsService);
    db = module.get(DatabaseService);
    networks = module.get(NetworksService);
    paymasters = module.get(PaymastersService);
    policies = module.get(PoliciesService);

    networks.get.mockReturnValue({
      chain: CHAINS['zksync-local'],
      estimateGas: async () => 0n,
    } satisfies DeepPartial<Network> as unknown as Network);

    paymasters.paymasterEthFees.mockImplementation(async () => ({
      total: new Decimal(0),
      activation: new Decimal(0),
    }));
    paymasters.for.mockReturnValue(ZERO_ADDR);
  });

  let user1: UserContext;
  let user1Account1: UAddress;

  beforeEach(async () => {
    user1 = randomUser();
    user1Account1 = randomUAddress();
  });

  const propose = async ({
    account = user1Account1,
    operations = [{ to: randomAddress(), value: 1n }],
    ...params
  }: Partial<ProposeTransactionInput> = {}) => {
    // Create account with an active policy
    const accountId = uuid();
    getUserCtx().accounts.push({ id: accountId, address: account });

    const inserted = await e
      .insert(e.Account, {
        id: accountId,
        address: account,
        label: randomLabel(),
        implementation: randomAddress(),
        salt: randomDeploySalt(),
        upgradedAtBlock: 1n,
      })
      .unlessConflict()
      .id.run(db.client);

    if (inserted) {
      await e
        .insert(e.Policy, {
          account: selectAccount(accountId),
          key: 0,
          name: 'Policy 0',
          threshold: 0,
          approvers: e
            .insert(e.Approver, { address: getApprover() })
            .unlessConflict((approver) => ({ on: approver.address, else: approver })),
          transfers: e.insert(e.TransfersConfig, { budget: 0 }),
        })
        .unlessConflict()
        .run(db.client);
    }

    policies.best.mockImplementation(async () => ({
      policy: selectPolicy({ account, key: 0 }) as any,
      validationErrors: [],
    }));

    return service.propose({ account, operations, gas: 1n, ...params });
  };

  describe('propose', () => {
    it('creates a proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();

        expect(await db.query(selectTransaction(id))).toBeTruthy();
      }));

    it('approves proposal if signature was provided', () =>
      asUser(user1, async () => {
        jest.spyOn(service, 'approve').mockImplementationOnce(async () => ({ id: '' }) as any);
        await propose({ signature });
        expect(service.approve).toHaveBeenCalled();
      }));
  });

  describe('selectUnqiue', () => {
    it('returns proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        expect(await service.selectUnique(id)).toBeTruthy();
      }));

    it("returns null if the proposal if from an account the user isn't a member of", async () => {
      const { id } = await asUser(user1, () => propose());

      await asUser(randomUser(), async () => {
        expect(await service.selectUnique(id)).toBeNull();
      });
    });
  });

  // describe('select', () => {
  //   it('returns proposals', () =>
  //     asUser(user1, async () => {
  //       await propose();
  //       await propose();

  //       expect(await service.select()).toHaveLength(2);
  //     }));

  //   it("doesn't return proposals from accounts the user isn't a member of", async () => {
  //     await asUser(user1, () => propose());

  //     await asUser(randomUser(), async () => {
  //       expect(await service.select()).toHaveLength(0);
  //     });
  //   });

  //   describe('accounts filter', () => {
  //     it('only return proposals from listed accounts', () =>
  //       asUser(user1, async () => {
  //         const [account1, account2] = [randomAddress(), randomAddress()];
  //         await propose({ account: account1 });
  //         await propose({ account: account2 });

  //         expect(await service.select({ accounts: [account1] })).toHaveLength(1);
  //       }));
  //   });

  //   describe('statuses filter', () => {
  //     let pending: uuid;
  //     let executing: uuid;
  //     let successful: uuid;
  //     let failed: uuid;

  //     beforeEach(() =>
  //       asUser(user1, async () => {
  //         pending = (await propose()).id;
  //         executing = (await propose()).id;
  //         successful = (await propose()).id;
  //         failed = (await propose()).id;
  //         // [pending, executing, successful, failed] = (
  //         //   await Promise.all([propose(), propose(), propose(), propose()])
  //         // ).map((p) => p.id);

  //         await Promise.all(
  //           [
  //             e.insert(e.SystemTx, {
  //               proposal: selectTransaction(executing),
  //               hash: randomHash(),
  //               gasPrice: 0n,
  //             }),
  //             e.insert(e.SystemTx, {
  //               proposal: selectTransaction(successful),
  //               hash: randomHash(),
  //               gasPrice: 0n,
  //               receipt: e.insert(e.Receipt, {
  //                 success: true,
  //                 responses: [],
  //                 gasUsed: 0n,
  //                 fee: 0n,
  //                 block: 0n,
  //                 timestamp: new Date(),
  //               }),
  //             }),
  //             e.insert(e.SystemTx, {
  //               proposal: selectTransaction(failed),
  //               hash: randomHash(),
  //               gasPrice: 0n,
  //               receipt: e.insert(e.Receipt, {
  //                 success: false,
  //                 responses: [],
  //                 gasUsed: 0n,
  //                 fee: 0n,
  //                 block: 0n,
  //                 timestamp: new Date(),
  //               }),
  //             }),
  //           ].map((expr) => expr.run(db.client)),
  //         );
  //       }),
  //     );

  //     it('pending', () =>
  //       asUser(user1, async () => {
  //         const proposals = await service.select({ statuses: [TransactionStatus.Pending] });
  //         expect(proposals.map((p) => p.id)).toEqual([pending]);
  //       }));

  //     it('executing', () =>
  //       asUser(user1, async () => {
  //         const proposals = await service.select({
  //           statuses: [TransactionStatus.Executing],
  //         });
  //         expect(proposals.map((p) => p.id)).toEqual([executing]);
  //       }));

  //     it('successful', () =>
  //       asUser(user1, async () => {
  //         const proposals = await service.select({
  //           statuses: [TransactionStatus.Successful],
  //         });
  //         expect(proposals.map((p) => p.id)).toEqual([successful]);
  //       }));

  //     it('failure', () =>
  //       asUser(user1, async () => {
  //         const proposals = await service.select({ statuses: [TransactionStatus.Failed] });
  //         expect(proposals.map((p) => p.id)).toEqual([failed]);
  //       }));

  //     it('multiple statuses', () =>
  //       asUser(user1, async () => {
  //         const proposals = await service.select({
  //           statuses: [TransactionStatus.Pending, TransactionStatus.Failed],
  //         });
  //         expect(new Set(proposals.map((p) => p.id))).toEqual(new Set([pending, failed]));
  //       }));
  //   });
  // });

  // describe('approve', () => {
  //   it('creates approval', () =>
  //     asUser(user1, async () => {
  //       const { hash } = await propose();

  //       await service.approve({ hash, signature });

  //       expect(
  //         await db.query(
  //           e.select(e.Approval, () => ({
  //             filter_single: {
  //               proposal: selectTransaction(hash),
  //               approver: e.global.current_approver,
  //             },
  //           })),
  //         ),
  //       ).toBeTruthy();
  //     }));

  //   it("throws if the proposal doesn't exist", () =>
  //     asUser(user1, async () => {
  //       await expect(service.approve({ hash: randomHash(), signature })).rejects.toThrow();
  //     }));

  //   it("throws if the signature isn't valid (from the user for that proposal)", () =>
  //     asUser(user1, async () => {
  //       const { hash } = await propose();

  //       provider.verifySignature.mockImplementationOnce(async () => false);
  //       await expect(service.approve({ hash, signature })).rejects.toThrow();
  //     }));

  //   it('tries to execute transaction', () =>
  //     asUser(user1, async () => {
  //       const { hash } = await propose();

  //       await service.approve({ hash, signature });
  //       expect(transactions.tryExecute).toHaveBeenCalled();
  //     }));

  //   // TODO: notification tests once it has been implemented
  //   // it("notifies active approvers that haven't approved", () =>
  //   //   asUser(user1, async () => {
  //   //     const { id, accountId } = await propose();

  //   //     const usersToNotify = [randomAddress(), randomAddress()];

  //   //     // Mark policy rules as active
  //   //     const policy: PolicyId = { account: asAddress(accountId), key: toPolicyKey(policyKey) };
  //   //     await prisma.asUser.policyRules.create({
  //   //       data: {
  //   //         account: connectAccount(policy.account),
  //   //         policy: connectPolicy(policy),
  //   //         activeStateOfPolicy: {
  //   //           connect: { accountId_key: { accountId, key: policyKey } },
  //   //         },
  //   //         approvers: {
  //   //           create: [user1.id, ...usersToNotify].map((user) => ({
  //   //             user: connectOrCreateUser(user),
  //   //           })),
  //   //         },
  //   //       },
  //   //     });

  //   //     await approve(id);

  //   //     expect(expo.chunkPushNotifications).toHaveBeenCalled();
  //   //   }));
  // });

  // describe('reject', () => {
  //   it('creates rejection', () =>
  //     asUser(user1, async () => {
  //       const { hash } = await propose();
  //       await service.reject(hash);

  //       expect(
  //         await db.query(
  //           e.select(e.Rejection, () => ({
  //             filter_single: {
  //               proposal: selectTransaction(hash),
  //               approver: e.global.current_approver,
  //             },
  //           })),
  //         ),
  //       ).toBeTruthy();
  //     }));

  //   it('creates rejection to proposal when the user had previously approved', () =>
  //     asUser(user1, async () => {
  //       const { hash } = await propose();

  //       await service.approve({ hash, signature });
  //       await service.reject(hash);

  //       expect(
  //         await db.query(
  //           e.select(e.Rejection, () => ({
  //             filter_single: {
  //               proposal: selectTransaction(hash),
  //               approver: e.global.current_approver,
  //             },
  //           })),
  //         ),
  //       ).toBeTruthy();
  //     }));

  //   it("throws if the proposal doesn't exist", () =>
  //     asUser(user1, async () => {
  //       await expect(service.approve({ hash: randomHash(), signature })).rejects.toThrow();
  //     }));
  // });

  describe('delete', () => {
    it('deletes proposal', () =>
      asUser(user1, async () => {
        const { id } = await propose();
        await service.delete(id);

        expect(await db.query(selectTransaction(id))).toBeNull();
      }));

    it("not remove if the policy doesn't exist", () =>
      asUser(user1, async () => {
        expect(await service.delete(asUUID(uuid()))).toEqual(null);
      }));

    it("not remove if the user isn't a member of the proposing account", async () => {
      const { id } = await asUser(user1, () => propose());

      await asUser(randomUser(), async () => expect(await service.delete(id)).toEqual(null));
    });

    it('deletes policy that the proposal was going to create', () =>
      asUser(user1, async () => {
        const { id } = await propose();

        const policy = await db.query(
          e.insert(e.Policy, {
            account: selectAccount(user1Account1),
            key: 1,
            name: 'Policy 1',
            proposal: selectTransaction(id),
            threshold: 0,
            transfers: e.insert(e.TransfersConfig, { budget: 0 }),
          }),
        );

        await service.delete(id);

        expect(await db.query(selectPolicy(policy.id))).toBeNull();
      }));
  });
});
