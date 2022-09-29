import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BytesLike, ethers } from 'ethers';
import { GraphQLResolveInfo } from 'graphql';
import {
  Address,
  getTxId,
  hashTx,
  Id,
  SignatureLike,
  validateSignature,
} from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import {
  connectAccount,
  connectOrCreateDevice,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  RevokeApprovalResp,
  UniqueProposalArgs,
  ProposalsArgs,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';
import { Proposal } from '@gen/proposal/proposal.model';
import { Prisma } from '@prisma/client';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() proposal: Proposal): Id {
    return getTxId(proposal.hash);
  }

  @Query(() => Proposal)
  async proposal(
    @Args() { hash }: UniqueProposalArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.prisma.proposal.findUniqueOrThrow({
      where: { hash },
      ...getSelect(info),
    });
  }

  @Query(() => [Proposal])
  async proposals(
    @Args() { accounts, ...args }: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      ...args,
      where: {
        ...(accounts && { accountId: { in: accounts } }),
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Proposal)
  async propose(
    @Args() { account, proposal, signature }: ProposeArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal> {
    const proposalHash = await hashTx(
      { address: account, provider: this.provider },
      proposal,
    );
    await this.validateSignatureOrThrow(device, proposalHash, signature);

    return this.prisma.proposal.upsert({
      where: { hash: proposalHash },
      create: {
        hash: proposalHash,
        account: connectAccount(account),
        proposer: {
          connect: {
            accountId_deviceId: {
              accountId: account,
              deviceId: device,
            },
          },
        },
        to: proposal.to,
        value: proposal.value.toString(),
        data: proposal.data,
        salt: proposal.salt,
        approvals: {
          create: {
            device: connectOrCreateDevice(device),
            signature,
          },
        },
      } as Prisma.ProposalCreateInput,
      update: {
        approvals: {
          create: {
            device: connectOrCreateDevice(device),
            signature,
          },
        },
      } as Prisma.ProposalUpdateInput,
      ...getSelect(info),
    } as const);
  }

  @Mutation(() => Proposal)
  async approve(
    @Args() { hash, signature }: ApproveArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal> {
    await this.validateSignatureOrThrow(device, hash, signature);

    return this.prisma.proposal.update({
      where: { hash },
      data: {
        approvals: {
          create: {
            device: connectOrCreateDevice(device),
            signature: ethers.utils.hexlify(signature),
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => RevokeApprovalResp)
  async revokeApproval(
    @Args() { hash }: UniqueProposalArgs,
    @DeviceAddr() device: Address,
  ): Promise<RevokeApprovalResp> {
    await this.prisma.proposal.update({
      where: { hash },
      data: {
        approvals: {
          delete: {
            proposalHash_deviceId: {
              proposalHash: hash,
              deviceId: device,
            },
          },
        },
      },
    });

    // Delete proposal if no approvals are left
    const approvalsLeft = await this.prisma.approval.count({
      where: { proposalHash: hash },
    });

    if (!approvalsLeft)
      await this.prisma.proposal.delete({
        where: { hash },
      });

    return { id: getTxId(hash) };
  }

  private async validateSignatureOrThrow(
    device: Address,
    proposalHash: BytesLike,
    signature: SignatureLike,
  ) {
    const isValid = validateSignature(device, proposalHash, signature);
    if (!isValid) throw new UserInputError('Invalid signature');
  }
}
