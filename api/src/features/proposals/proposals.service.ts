import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma, Proposal } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { BytesLike, hexlify, recoverAddress } from 'ethers/lib/utils';
import {
  toTx,
  hashTx,
  TxOptions,
  isTruthy,
  Address,
  QuorumKey,
  isPresent,
  SignatureLike,
  tryOrDefault,
  QuorumGuid,
  address,
  toQuorumKey,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { connectAccount, connectQuorum, connectUser } from '~/util/connect-or-create';
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
} from './proposals.args';
import { getUser, getUserId } from '~/request/ctx';
import { match } from 'ts-pattern';
import { QuorumsService } from '../quorums/quorums.service';
import { ExpoService } from '../util/expo/expo.service';

export interface ProposeParams extends TxOptions {
  account: Address;
  quorumKey?: QuorumKey;
  signature?: string;
}

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private expo: ExpoService,
    private pubsub: PubsubService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
    @Inject(forwardRef(() => QuorumsService))
    private quorums: QuorumsService,
  ) {}

  findUnique = this.prisma.asUser.proposal.findUnique;

  async findMany<A extends Prisma.ProposalArgs>(
    { accounts, states, actionRequired, where, ...args }: ProposalsArgs = {},
    res?: Prisma.SelectSubset<A, Prisma.ProposalArgs>,
  ) {
    const user = getUserId();

    return this.prisma.asUser.proposal.findMany({
      ...args,
      where: {
        AND: (
          [
            where,
            accounts && { accountId: { in: [...accounts] } },
            states && {
              OR: states.map((state) =>
                match<ProposalState, Prisma.ProposalWhereInput>(state)
                  .with(ProposalState.Pending, () => ({
                    transactions: { none: {} },
                  }))
                  .with(ProposalState.Executing, () => ({
                    transactions: {
                      some: {
                        AND: [{}, { NOT: { response: {} } }],
                      },
                    },
                  }))
                  .with(ProposalState.Executed, () => ({
                    transactions: { some: { response: { is: { success: { equals: true } } } } },
                  }))
                  .exhaustive(),
              ),
            },
            actionRequired !== undefined &&
              (actionRequired
                ? {
                    transactions: { none: {} },
                    quorum: { activeState: { approvers: { some: { userId: user } } } },
                    approvals: { none: { userId: user } },
                  }
                : {
                    NOT: {
                      quorum: { activeState: { approvers: { some: { userId: user } } } },
                      approvals: { none: { userId: user } },
                    },
                  }),
          ] as const
        ).filter(isTruthy),
      },
      orderBy: { createdAt: 'desc' },
      ...res,
    });
  }

  async propose<T extends Prisma.ProposalArgs>(
    { account, quorumKey, signature, ...options }: ProposeParams,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
    client?: Prisma.TransactionClient,
  ) {
    return this.prisma.$transactionAsUser(client, async (client) => {
      const tx = toTx(options);

      if (!quorumKey) quorumKey = (await this.quorums.getDefaultQuorum(account)).key;

      const proposal = await client.proposal.create({
        data: {
          id: await hashTx(tx, { address: account, provider: this.provider }),
          account: connectAccount(account),
          quorum: connectQuorum(account, quorumKey),
          proposer: connectUser(getUser().id),
          to: tx.to,
          value: tx.value?.toString(),
          data: tx.data ? hexlify(tx.data) : undefined,
          salt: tx.salt,
          gasLimit: tx.gasLimit?.toString(),
        },
        ...(signature ? { select: { id: true } } : res),
      });

      if (!signature) this.publishProposal({ proposal, event: ProposalEvent.create });

      return signature ? this.approve({ id: proposal.id, signature }, res) : proposal;
    });
  }

  async approve<T extends Omit<Prisma.ProposalArgs, 'include'>>(
    { id, signature }: ApproveArgs,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
    client: Prisma.TransactionClient = this.prisma.asUser,
  ): Promise<Proposal> {
    const user = getUser().id;
    if (!this.isValidSignature(user, id, signature)) throw new UserInputError('Invalid signature');

    await client.approval.create({
      data: {
        proposalId: id,
        userId: user,
        signature,
      },
      select: null,
    });

    const executedProposal = await this.transactions.tryExecute(id, res);
    if (executedProposal) return executedProposal; // proposal update is published upon execution

    const proposal = await client.proposal.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { approvals: true } } },
      ...res,
    });

    if ((proposal as any)._count.approvals === 1) await this.notifyApprovers(id);

    this.publishProposal({ proposal, event: ProposalEvent.update });

    return proposal;
  }

  async reject<T extends Prisma.ProposalArgs>(
    { id }: UniqueProposalArgs,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
  ) {
    const user = getUserId();

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
        proposal: { ...res },
      },
    });

    this.publishProposal({ proposal, event: ProposalEvent.update });

    return proposal;
  }

  async delete<A extends Prisma.ProposalArgs>(
    { id }: UniqueProposalArgs,
    res?: Prisma.SelectSubset<A, Prisma.ProposalArgs>,
  ) {
    // Delete quorums for which this proposal contains their creation state
    return this.prisma.asUser.$transaction(async (tx) => {
      const { quorumStates, ...r } = await tx.proposal.delete({
        where: { id },
        select: {
          ...(res?.select ?? {}),
          quorumStates: {
            select: {
              quorum: {
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

      const uniqueQuorumsToRemove = new Map(
        quorumStates
          .filter((s) => s.quorum._count.states === 1)
          .map((s) => {
            const quorum: QuorumGuid = {
              account: address(s.quorum.accountId),
              key: toQuorumKey(s.quorum.key),
            };
            return [quorum, quorum];
          }),
      ).values();

      await Promise.all(
        [...uniqueQuorumsToRemove].map((quorum) => this.quorums.remove(quorum, undefined, tx)),
      );

      return r as Partial<Proposal>;
    });
  }

  async publishProposal(payload: ProposalSubscriptionPayload) {
    await this.pubsub.publish<ProposalSubscriptionPayload>(
      `${PROPOSAL_SUBSCRIPTION}.${payload[PROPOSAL_SUBSCRIPTION].id}`,
      payload,
    );
    await this.pubsub.publish<ProposalSubscriptionPayload>(
      `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${payload[PROPOSAL_SUBSCRIPTION].accountId}`,
      payload,
    );
  }

  private async notifyApprovers(proposalId: string) {
    // Data is fetched as superuser to user's RLS settings - in order to get the approvers' push tokens
    const { approvals, quorum } = await this.prisma.asSuperuser.proposal.findUniqueOrThrow({
      where: { id: proposalId },
      select: {
        approvals: { select: { userId: true } },
        quorum: {
          select: {
            key: true,
            activeState: {
              select: {
                approvers: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        pushToken: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const alreadyApproved = new Set(approvals.map((a) => a.userId));
    const approverPushTokens = (quorum.activeState?.approvers ?? [])
      .filter((a) => !alreadyApproved.has(a.user.id) && a.user.pushToken)
      .map((a) => a.user.pushToken)
      .filter(isPresent);

    // Send a notification to specified users that haven't approved yet
    this.expo.chunkPushNotifications([
      {
        to: approverPushTokens,
        title: 'Approval Request',
        body: 'Your approval has been required on a proposal',
        data: { url: `zallo://proposal/?id=${proposalId}` },
      },
    ]);

    // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications

    return true;
  }

  // TODO: ERC-1271 support - https://v2-docs.zksync.io/dev/developer-guides/aa.html#verifying-aa-signatures-within-our-sdk
  isValidSignature(signer: Address, digest: BytesLike, signature: SignatureLike) {
    return tryOrDefault(() => recoverAddress(digest, signature) === signer, false);
  }
}
