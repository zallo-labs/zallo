import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
} from './proposals.args';
import { getUserContext } from '~/request/ctx';

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

  async create<T extends Prisma.ProposalCreateArgs>(
    { quorum, options, ...args }: CreateParams<T>,
    client: Prisma.TransactionClient = this.prisma.asUser,
  ): Promise<Prisma.ProposalGetPayload<T>> {
    const tx = toTx(options);

    const proposal = (await client.proposal.create({
      ...args,
      data: {
        id: await hashTx(tx, this.provider.connectAccount(quorum.account)),
        account: connectAccount(quorum.account),
        quorum: connectQuorum(quorum),
        proposer: connectUser(getUserContext().id),
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
    const user = getUserContext().id;
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

    await this.transactions.tryExecute(id);

    const proposal = await client.proposal.findUniqueOrThrow({
      ...args,
      where: { id },
    });

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
