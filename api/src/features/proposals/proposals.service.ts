import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { Address, validateSignature } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { SubmissionsService } from '../submissions/submissions.service';
import { ApproveArgs } from './proposals.args';

interface ApproveParams extends ApproveArgs {
  device: Address;
  args?: Omit<Prisma.ProposalFindUniqueOrThrowArgs, 'where'>;
}

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService, private submissions: SubmissionsService) {}

  async approve({ id, signature, device, args }: ApproveParams) {
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

    await this.submissions.tryExecute(id);

    return this.prisma.proposal.findUniqueOrThrow({
      ...args,
      where: { id },
    });
  }

  async validateSignatureOrThrow(device: Address, proposalHash: string, signature: string) {
    const isValid = validateSignature(device, proposalHash, signature);
    if (!isValid) throw new UserInputError('Invalid signature');
  }
}
