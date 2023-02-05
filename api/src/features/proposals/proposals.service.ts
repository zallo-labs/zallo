import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma, Proposal } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { hexlify } from 'ethers/lib/utils';
import { toTx, hashTx, isValidSignature, TxOptions, QuorumGuid } from 'lib';
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
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  UniqueProposalArgs,
} from './proposals.args';
import { getUser, getUserId } from '~/request/ctx';

type CreateParams<T extends Prisma.ProposalCreateArgs> = {
  quorum: QuorumGuid;
  options: TxOptions;
} & Omit<Prisma.SelectSubset<T, Prisma.ProposalCreateArgs>, 'data'>;

type ApproveParams = ApproveArgs & Omit<Prisma.ProposalFindUniqueOrThrowArgs, 'where'>;

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    @Inject(forwardRef(() => TransactionsService))
    private transactions: TransactionsService,
  ) {}

  async propose<T extends Prisma.ProposalCreateArgs>(
    { quorum, options, ...args }: CreateParams<T>,
    client: Prisma.TransactionClient = this.prisma.asUser,
  ) {
    const tx = toTx(options);

    const proposal = (await client.proposal.create({
      ...args,
      data: {
        id: await hashTx(tx, this.provider.connectAccount(quorum.account)),
        account: connectAccount(quorum.account),
        quorum: connectQuorum(quorum),
        proposer: connectUser(getUser().id),
        to: tx.to,
        value: tx.value?.toString(),
        data: tx.data ? hexlify(tx.data) : undefined,
        salt: tx.salt,
        gasLimit: tx.gasLimit?.toString(),
      },
    })) as Prisma.ProposalGetPayload<T>;

    this.publishProposal({ proposal, event: ProposalEvent.create });

    return proposal;
  }

  async approve(
    { id, signature, ...args }: ApproveParams,
    client: Prisma.TransactionClient = this.prisma.asUser,
  ) {
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

    const executedProposal = await this.transactions.tryExecute(id, args);
    if (executedProposal) return executedProposal; // proposal update is published upon execution

    const proposal = await client.proposal.findUniqueOrThrow({
      ...args,
      where: { id },
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
