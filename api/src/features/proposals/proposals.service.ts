import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma, Proposal } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { hexlify } from 'ethers/lib/utils';
import { Address, createTx, hashTx, randomTxSalt, TxDef, validateSignature } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/provider/provider.service';
import { PubsubService } from '~/pubsub/pubsub.service';
import { connectAccount, connectOrCreateDevice } from '~/util/connect-or-create';
import { TransactionsService } from '../transactions/transactions.service';
import { ApproveArgs } from './proposals.args';

type CreateParams<T extends Prisma.ProposalCreateArgs> = {
  account: Address;
  data: TxDef & Omit<Prisma.ProposalCreateInput, keyof TxDef | 'account' | 'id'>;
} & Omit<Prisma.SelectSubset<T, Prisma.ProposalCreateArgs>, 'data'>;

type ApproveParams = { device: Address } & ApproveArgs &
  Omit<Prisma.ProposalFindUniqueOrThrowArgs, 'where'>;

export const PROPOSAL_SUB = 'proposal';

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
    const tx = createTx(data);
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

    this.publishProposal(proposal);

    return proposal;
  }

  async approve({ id, signature, device, ...args }: ApproveParams) {
    await this.validateSignatureOrThrow(device, id, signature);

    await this.prisma.proposal.update({
      where: { id },
      data: {
        approvals: {
          create: {
            device: connectOrCreateDevice(device),
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

    this.publishProposal(proposal);
    return proposal;
  }

  public publishProposal(proposal: Proposal) {
    this.pubsub.publish(PROPOSAL_SUB, { [PROPOSAL_SUB]: proposal });
  }

  async validateSignatureOrThrow(device: Address, proposalHash: string, signature: string) {
    const isValid = validateSignature(device, proposalHash, signature);
    if (!isValid) throw new UserInputError('Invalid signature');
  }
}
