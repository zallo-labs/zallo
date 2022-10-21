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
  isPresent,
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
  ApprovalRequest,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';
import { Proposal } from '@gen/proposal/proposal.model';
import { Prisma } from '@prisma/client';
import { ExpoService } from '~/expo/expo.service';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private expo: ExpoService,
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
        ...(accounts && { accountId: { in: [...accounts] } }),
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
        gasLimit: proposal.gasLimit?.toString(),
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

  @Mutation(() => Boolean)
  async requestApproval(
    @Args() { hash, approvers }: ApprovalRequest,
    @DeviceAddr() device: Address,
  ): Promise<true> {
    // Ensure all approvers are valid for the given proposal
    const { accountId, approvals } =
      await this.prisma.proposal.findUniqueOrThrow({
        where: { hash },
        select: {
          accountId: true,
          approvals: {
            select: {
              deviceId: true,
            },
          },
        },
      });

    const approversInAccount = await this.prisma.user.findMany({
      where: {
        accountId,
        deviceId: { in: [...approvers] },
      },
      select: {
        device: {
          select: {
            id: true,
            pushToken: true,
          },
        },
      },
    });

    if (approversInAccount.length !== approvers.size)
      throw new UserInputError("Some approvers aren't users of the account");

    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        accountId_deviceId: {
          accountId,
          deviceId: device,
        },
      },
      select: {
        name: true,
      },
    });

    // Send a notification to specified users that haven't approved yet
    this.expo.chunkPushNotifications([
      {
        to: approversInAccount
          .filter(
            (user) => !approvals.find((a) => a.deviceId === user.device.id),
          )
          .map((user) => user.device.pushToken)
          .filter(isPresent),
        title: 'Approval Request',
        body: `${user.name} has requested your approval`,
        data: {
          url: `allopay://transaction/?id=${hash}`,
        },
      },
    ]);

    // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications

    return true;
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
