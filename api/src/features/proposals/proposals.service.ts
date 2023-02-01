import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { hexlify } from 'ethers/lib/utils';
import { Address, toTx, hashTx, randomTxSalt, isValidSignature, TxOptions } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { connectAccount, connectOrCreateUser } from '~/util/connect-or-create';
import { TransactionsService } from '../transactions/transactions.service';
import {
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
  ApproveArgs,
  ProposalEvent,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
} from './proposals.args';

type CreateParams<T extends Prisma.ProposalCreateArgs> = {
  account: Address;
  data: TxOptions & Omit<Prisma.ProposalCreateInput, keyof TxOptions | 'account' | 'id'>;
} & Omit<Prisma.SelectSubset<T, Prisma.ProposalCreateArgs>, 'data'>;

type ApproveParams = { user: Address } & ApproveArgs &
  Omit<Prisma.ProposalFindUniqueOrThrowArgs, 'where'>;

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
    { account, data, ...args }: CreateParams<T>,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ProposalGetPayload<T>> {
    const tx = toTx(data);
    const id = await hashTx(tx, { address: account, provider: this.provider });

    const proposal = (await client.proposal.create({
      ...args,
      data: {
        ...data,
        account: connectAccount(account),
        id,
        to: tx.to,
        value: data.value?.toString(),
        data: data.data ? hexlify(data.data) : undefined,
        salt: data.salt ?? randomTxSalt(),
        gasLimit: data.gasLimit?.toString(),
      },
    })) as Prisma.ProposalGetPayload<T>;

    this.publishProposal({ proposal, event: ProposalEvent.create });

    return proposal;
  }

  async approve({ id, signature, user, ...args }: ApproveParams) {
    if (!isValidSignature(user, id, signature)) throw new UserInputError('Invalid signature');

    await this.prisma.proposal.update({
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

    const proposal = await this.prisma.proposal.findUniqueOrThrow({
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
