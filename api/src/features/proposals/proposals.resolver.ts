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
  connectOrCreateDevice,
  connectOrCreateAccount,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  RevokeApprovalResp,
  UniqueProposalArgs,
  ProposalsArgs,
} from './proposals.args';
import { Submission } from '@gen/submission/submission.model';
import { SubmissionsService } from '../submissions/submissions.service';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';
import { Proposal } from '@gen/proposal/proposal.model';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private submissionsService: SubmissionsService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() proposal: Proposal): Id {
    return getTxId(proposal.hash);
  }

  @ResolveField(() => [Submission])
  async submissions(@Parent() proposal: Proposal): Promise<Submission[]> {
    return await this.submissionsService.updateUnfinalized(
      proposal.submissions ?? [],
    );
  }

  @Query(() => Proposal, { nullable: true })
  async proposal(
    @Args() { account, hash }: UniqueProposalArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal | null> {
    return this.prisma.proposal.findUnique({
      where: {
        accountId_hash: { accountId: account, hash },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [Proposal])
  async proposals(
    @Args() { accounts }: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal[]> {
    return (
      (await this.prisma.proposal.findMany({
        where: {
          accountId: { in: accounts },
        },
        ...getSelect(info),
      })) ?? []
    );
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
      where: { accountId_hash: { hash: proposalHash, accountId: account } },
      create: {
        account: connectOrCreateAccount(account),
        hash: proposalHash,
        to: proposal.to,
        value: proposal.value.toString(),
        data: proposal.data,
        salt: proposal.salt,
        approvals: {
          create: {
            user: connectOrCreateDevice(device),
            account: connectOrCreateAccount(account),
            signature,
          },
        },
      },
      update: {
        approvals: {
          create: {
            user: connectOrCreateDevice(device),
            account: connectOrCreateAccount(account),
            signature,
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Proposal, { nullable: true })
  async approve(
    @Args() { account, hash, signature }: ApproveArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal | null> {
    await this.validateSignatureOrThrow(device, hash, signature);

    return this.prisma.proposal.update({
      where: { accountId_hash: { accountId: account, hash } },
      data: {
        approvals: {
          create: {
            account: connectOrCreateAccount(account),
            user: connectOrCreateDevice(device),
            signature: ethers.utils.hexlify(signature),
          },
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => RevokeApprovalResp)
  async revokeApproval(
    @Args() { account, hash }: UniqueProposalArgs,
    @DeviceAddr() device: Address,
  ): Promise<RevokeApprovalResp> {
    await this.prisma.proposal.update({
      where: { hash },
      data: {
        approvals: {
          delete: {
            accountId_proposalHash_deviceId: {
              accountId: account,
              proposalHash: hash,
              deviceId: device,
            },
          },
        },
      },
    });

    // Delete proposal if no approvals are left
    const approvalsLeft = await this.prisma.approval.count({
      where: { accountId: account, proposalHash: hash },
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
