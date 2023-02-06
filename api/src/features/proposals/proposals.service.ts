import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma, Proposal } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { hexlify } from 'ethers/lib/utils';
import { toTx, hashTx, isValidSignature, TxOptions, isTruthy, Address, QuorumKey } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import {
  connectAccount,
  connectOrCreateUser,
  connectQuorum,
  connectUser,
} from '~/util/connect-or-create';
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

interface ProposeParams extends TxOptions {
  account: Address;
  quorumKey?: QuorumKey;
  signature?: string;
}

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
    @Inject(forwardRef(() => QuorumsService))
    private quorums: QuorumsService,
  ) {}

  findUnique = this.prisma.asUser.proposal.findUnique;

  async findMany<A extends Prisma.ProposalArgs>(
    { accounts, states, actionRequired, where, ...args }: ProposalsArgs,
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
                      some: {},
                      none: { response: {} },
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
    res: Prisma.SelectSubset<T, Prisma.ProposalArgs> | undefined,
    client?: Prisma.TransactionClient,
  ) {
    return this.prisma.$transactionAsUser(client, async (client) => {
      const tx = toTx(options);

      if (!quorumKey) quorumKey = (await this.quorums.getDefaultQuorum(account)).key;

      const proposal = await client.proposal.create({
        data: {
          id: await hashTx(tx, this.provider.connectAccount(account)),
          account: connectAccount(account),
          quorum: connectQuorum(account, quorumKey),
          proposer: connectUser(getUser().id),
          to: tx.to,
          value: tx.value?.toString(),
          data: tx.data ? hexlify(tx.data) : undefined,
          salt: tx.salt,
          gasLimit: tx.gasLimit?.toString(),
        },
        // ...res,
        ...(signature ? { select: { id: true } } : res),
      });

      if (!signature) this.publishProposal({ proposal, event: ProposalEvent.create });

      return signature ? this.approve({ id: proposal.id, signature }, res) : proposal;
    });
  }

  async approve<T extends Prisma.ProposalArgs>(
    { id, signature }: ApproveArgs,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
    client: Prisma.TransactionClient = this.prisma.asUser,
  ): Promise<Proposal> {
    const user = getUser().id;
    if (!isValidSignature(user, id, signature)) throw new UserInputError('Invalid signature');

    await client.proposal.update({
      where: { id },
      data: {
        approvals: {
          create: {
            user: connectOrCreateUser(user),
            signature,
          },
        },
      },
      select: null,
    });

    const executedProposal = await this.transactions.tryExecute(id, res);
    if (executedProposal) return executedProposal; // proposal update is published upon execution

    const proposal = await client.proposal.findUniqueOrThrow({
      where: { id },
      ...res,
    });

    this.publishProposal({ proposal, event: ProposalEvent.update });

    return proposal;
  }

  async reject<T extends Prisma.ProposalArgs>({ id }: UniqueProposalArgs, respArgs?: T) {
    const user = getUserId();

    const proposal = (await this.prisma.asUser.proposal.update({
      where: { id },
      data: {
        approvals: {
          upsert: {
            where: {
              proposalId_userId: {
                proposalId: id,
                userId: user,
              },
            },
            create: {
              user: connectOrCreateUser(user),
            },
            update: {
              signature: null,
              createdAt: new Date(),
            },
          },
        },
      },
      ...respArgs,
    })) as Prisma.ProposalGetPayload<T>;

    this.publishProposal({ proposal, event: ProposalEvent.update });

    return proposal;
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
}
