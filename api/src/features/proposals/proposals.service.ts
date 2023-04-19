import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma, Proposal } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { hexlify } from 'ethers/lib/utils';
import {
  hashTx,
  isTruthy,
  Address,
  asAddress,
  Tx,
  PolicyId,
  asPolicyKey,
  PolicySatisfiability,
  estimateOpGas,
  Hex,
  asBigInt,
  asHex,
  Erc20__factory,
  asSelector,
  Addresslike,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { connectAccount, connectOrCreateUser } from '~/util/connect-or-create';
import { TransactionsService } from '../transactions/transactions.service';
import {
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
  ApproveArgs,
  ProposalEvent,
  ProposalsArgs,
  ProposalState,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  UniqueProposalArgs,
  PROPOSAL_PAYLOAD_SELECT,
} from './proposals.args';
import { getUser } from '~/request/ctx';
import { match } from 'ts-pattern';
import { ExpoService } from '../util/expo/expo.service';
import { O } from 'ts-toolbelt';
import { PoliciesService, SelectManyPoliciesArgs } from '../policies/policies.service';
import { SatisfiablePolicy } from './proposals.model';
import { ExplorerTransfer } from '../explorer/explorer.model';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { BigNumberish } from 'ethers';
import merge from 'ts-deepmerge';

const TX_IS_EXECUTING: Prisma.TransactionWhereInput = { response: { isNot: {} } };
const TX_IS_EXECUTED: Prisma.TransactionWhereInput = {
  response: { is: { success: { equals: true } } },
};
const PROPOSAL_IS_PENDING: Prisma.ProposalWhereInput = {
  transactions: { none: { OR: [TX_IS_EXECUTING, TX_IS_EXECUTED] } },
};

const ERC20 = Erc20__factory.createInterface();
const ERC20_TRANSFER = ERC20.functions['transfer(address,uint256)'];
const ERC20_TRANSFER_SELECTOR = asSelector(ERC20.getSighash(ERC20_TRANSFER));

export interface ProposeParams extends O.Optional<Tx, 'nonce'> {
  account: Address;
  signature?: Hex;
  feeToken?: Address;
}

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    private expo: ExpoService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
    @Inject(forwardRef(() => PoliciesService))
    private policies: PoliciesService,
  ) {}

  findUnique = this.prisma.asUser.proposal.findUnique;

  async findMany<A extends Prisma.ProposalArgs>(
    { accounts, states, where, ...args }: ProposalsArgs = {},
    res?: Prisma.SelectSubset<A, Prisma.ProposalArgs>,
  ) {
    return this.prisma.asUser.proposal.findMany({
      orderBy: { createdAt: 'desc' },
      ...args,
      where: {
        AND: [
          where,
          accounts && { accountId: { in: [...accounts] } },
          states && {
            OR: [...states].map((state) =>
              match<ProposalState, Prisma.ProposalWhereInput>(state)
                .with(ProposalState.Pending, () => PROPOSAL_IS_PENDING)
                .with(ProposalState.Executing, () => ({
                  transactions: { some: TX_IS_EXECUTING },
                }))
                .with(ProposalState.Executed, () => ({
                  transactions: { some: TX_IS_EXECUTED },
                }))
                .exhaustive(),
            ),
          },
        ].filter(isTruthy),
      },
      ...res,
    });
  }

  async propose<T extends Prisma.ProposalArgs>(
    { account, signature, feeToken, ...txOptions }: ProposeParams,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
    prisma?: Prisma.TransactionClient,
  ) {
    return this.prisma.$transactionAsUser(prisma, async (client) => {
      const tx: Tx = {
        ...txOptions,
        nonce: BigInt(await client.proposal.count({ where: { account: { id: account } } })),
      };

      const proposal = (await client.proposal.create({
        data: {
          id: await hashTx(tx, { address: account, provider: this.provider }),
          account: connectAccount(account),
          proposer: connectOrCreateUser(),
          to: tx.to,
          value: tx.value?.toString(),
          data: tx.data ? hexlify(tx.data) : undefined,
          nonce: tx.nonce,
          gasLimit: tx.gasLimit,
          estimatedOpGas: await estimateOpGas(this.provider, tx),
          feeToken,
        },
        select: merge(res?.select ?? {}, PROPOSAL_PAYLOAD_SELECT),
      })) as Prisma.ProposalGetPayload<T>;

      if (!signature) this.publishProposal({ proposal, event: ProposalEvent.create });

      return signature ? this.approve({ id: proposal.id, signature }, res) : proposal;
    });
  }

  async approve<T extends Omit<Prisma.ProposalArgs, 'include'>>(
    { id, signature }: ApproveArgs,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
    prisma: Prisma.TransactionClient = this.prisma.asUser,
  ): Promise<Proposal> {
    const user = getUser();
    if (!(await this.provider.verifySignature({ digest: id, approver: user, signature })))
      throw new UserInputError('Invalid signature');

    await prisma.approval.upsert({
      where: {
        proposalId_userId: { proposalId: id, userId: user },
      },
      create: {
        proposalId: id,
        userId: user,
        signature,
      },
      update: {
        signature,
      },
      select: null,
    });

    const executedProposal = await this.transactions.tryExecute(id, res);
    if (executedProposal) return executedProposal; // proposal update is published upon execution

    const proposal = await prisma.proposal.findUniqueOrThrow({
      where: { id },
      select: {
        _count: { select: { approvals: true } },
        ...PROPOSAL_PAYLOAD_SELECT,
      },
    });

    if (proposal._count.approvals === 1) await this.notifyApprovers(id);

    this.publishProposal({ proposal, event: ProposalEvent.update });

    return prisma.proposal.findUniqueOrThrow({ where: { id }, ...res });
  }

  async reject<T extends Prisma.ProposalArgs>(
    { id }: UniqueProposalArgs,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
  ) {
    const user = getUser();

    const { proposal } = await this.prisma.asUser.approval.upsert({
      where: {
        proposalId_userId: {
          proposalId: id,
          userId: user,
        },
      },
      create: {
        proposalId: id,
        userId: user,
      },
      update: {
        signature: null,
      },
      select: {
        proposal: {
          select: merge(res?.select ?? {}, PROPOSAL_PAYLOAD_SELECT),
        },
      },
    });

    this.publishProposal({ proposal, event: ProposalEvent.update });

    return proposal as Prisma.ProposalGetPayload<T>;
  }

  async delete<A extends Prisma.ProposalArgs>(
    { id }: UniqueProposalArgs,
    res?: Prisma.SelectSubset<A, Prisma.ProposalArgs>,
  ) {
    // Delete policies for which this proposal contains their creation state
    return this.prisma.asUser.$transaction(async (client) => {
      const { policyStates, ...r } = await client.proposal.delete({
        where: { id },
        select: {
          ...(res?.select ?? {}),
          policyStates: {
            select: {
              policy: {
                select: {
                  _count: { select: { states: true } },
                  accountId: true,
                  key: true,
                },
              },
            },
          },
        },
      });

      const policiesToRemove = new Map(
        policyStates
          .filter((s) => s.policy._count.states === 1)
          .map(({ policy }) => {
            const guid: PolicyId = {
              account: asAddress(policy.accountId),
              key: asPolicyKey(policy.key),
            };
            return [guid, guid];
          }),
      ).values();

      await Promise.all(
        [...policiesToRemove].map((policy) => this.policies.remove(policy, undefined, client)),
      );

      return r as Partial<Proposal>;
    });
  }

  async publishProposal(payload: ProposalSubscriptionPayload) {
    console.log(`
      Publishing proposal:
      ${PROPOSAL_SUBSCRIPTION}.${payload[PROPOSAL_SUBSCRIPTION].id}
      ${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${payload[PROPOSAL_SUBSCRIPTION].accountId}
    `);
    await Promise.all([
      this.pubsub.publish<ProposalSubscriptionPayload>(
        `${PROPOSAL_SUBSCRIPTION}.${payload[PROPOSAL_SUBSCRIPTION].id}`,
        payload,
      ),
      this.pubsub.publish<ProposalSubscriptionPayload>(
        `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${payload[PROPOSAL_SUBSCRIPTION].accountId}`,
        payload,
      ),
    ]);
  }

  async satisfiablePolicies(
    proposalId: string,
    query?: SelectManyPoliciesArgs,
  ): Promise<SatisfiablePolicy[]> {
    const user = getUser();
    const userHasApproved = !!(await this.prisma.asUser.approval.count({
      where: { proposalId, userId: user },
    }));

    const policies: SatisfiablePolicy[] = [];
    for await (const [policy, satisfiability] of this.policies.policiesWithSatisfiability(
      proposalId,
      query,
    )) {
      if (satisfiability !== PolicySatisfiability.Unsatisifable) {
        policies.push({
          id: `${proposalId}-${policy.key}`,
          key: policy.key,
          satisfied: satisfiability === PolicySatisfiability.Satisfied,
          requiresUserAction:
            satisfiability === PolicySatisfiability.Satisfiable &&
            !userHasApproved &&
            policy.approvers.has(user),
        });
      }
    }

    return policies;
  }

  async transfers(p: Proposal): Promise<ExplorerTransfer[]> {
    const to = asAddress(p.to);
    const from = asAddress(p.accountId);
    const value = p.value ? asBigInt(p.value.toString()) : undefined;
    const data = p.data ? asHex(p.data) : undefined;

    const transfers: ExplorerTransfer[] = [];
    if (value && value > 0n) {
      transfers.push({
        id: `${p.id}-0`,
        transferNumber: 0,
        token: asAddress(ETH_ADDRESS),
        from,
        to,
        amount: value,
        timestamp: p.createdAt,
      });
    }

    // Infer ERC20 transfer from proposal data; ideally the transaction would be simulated
    if (data && asSelector(data) === ERC20_TRANSFER_SELECTOR) {
      try {
        const [dest, amount] = ERC20.decodeFunctionData(ERC20_TRANSFER, data) as [
          Addresslike,
          BigNumberish,
        ];
        const transferNumber = transfers.length;

        transfers.push({
          id: `${p.id}-${transferNumber}`,
          transferNumber,
          token: to,
          from,
          to: asAddress(dest),
          amount: asBigInt(amount),
          timestamp: p.createdAt,
        });
      } catch (e) {
        Logger.warn(`Failed to decode ERC20 transfer data; data=${data}, error=${e}`);
      }
    }

    return transfers;
  }

  private async notifyApprovers(proposalId: string) {
    // TODO: implement
    // const { approvals, quorum } = await this.prisma.asUser.proposal.findUniqueOrThrow({
    //   where: { id: proposalId },
    //   select: {
    //     approvals: { select: { userId: true } },
    //     quorum: {
    //       select: {
    //         key: true,
    //         activeState: {
    //           select: {
    //             approvers: {
    //               select: {
    //                 user: {
    //                   select: {
    //                     id: true,
    //                     pushToken: true,
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });
    // const alreadyApproved = new Set(approvals.map((a) => a.userId));
    // const approverPushTokens = (quorum.activeState?.approvers ?? [])
    //   .filter((a) => !alreadyApproved.has(a.user.id) && a.user.pushToken)
    //   .map((a) => a.user.pushToken)
    //   .filter(isPresent);
    // // Send a notification to specified users that haven't approved yet
    // this.expo.chunkPushNotifications([
    //   {
    //     to: approverPushTokens,
    //     title: 'Approval Request',
    //     body: 'Your approval has been required on a proposal',
    //     data: { url: `zallo://proposal/?id=${proposalId}` },
    //   },
    // ]);
    // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications
  }
}
