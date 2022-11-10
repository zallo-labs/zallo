import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Address, getTxId, hashTx, Id, isPresent } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import { connectAccount, connectOrCreateDevice } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  UniqueProposalArgs,
  ProposalsArgs,
  ApprovalRequest,
  ProposalStatus,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';
import { Proposal } from '@gen/proposal/proposal.model';
import { ExpoService } from '~/expo/expo.service';
import { match } from 'ts-pattern';
import { ProposalWhereInput } from '@gen/proposal/proposal-where.input';
import { UsersService } from '../users/users.service';
import assert from 'assert';
import { hexlify } from 'ethers/lib/utils';
import { ProposalsService } from './proposals.service';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private service: ProposalsService,
    private prisma: PrismaService,
    private provider: ProviderService,
    private expo: ExpoService,
    private users: UsersService,
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
    @Args() { accounts, status, ...args }: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      ...args,
      where: {
        ...(accounts && { accountId: { in: [...accounts] } }),
        ...(status &&
          match<ProposalStatus, ProposalWhereInput>(status)
            .with(ProposalStatus.Executed, () => ({
              submissions: {
                some: { response: { is: { reverted: { equals: false } } } },
              },
            }))
            .with(ProposalStatus.AwaitingUser, () => ({
              submissions: {
                none: { response: { is: { reverted: { equals: false } } } },
              },
              approvals: {
                none: { deviceId: { equals: device } },
              },
            }))
            .with(ProposalStatus.AwaitingOther, () => ({
              submissions: {
                none: { response: { is: { reverted: { equals: false } } } },
              },
              approvals: {
                some: { deviceId: { equals: device } },
              },
            }))
            .exhaustive()),
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Proposal)
  async propose(
    @Args() { account, configId, proposal, signature, executeWhenApproved }: ProposeArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal> {
    const hash = await hashTx({ address: account, provider: this.provider }, proposal);

    if (configId !== undefined) {
      const config = await this.prisma.userConfig.findUniqueOrThrow({
        where: { id: configId },
        select: {
          state: {
            select: {
              accountId: true,
              deviceId: true,
            },
          },
        },
      });
      if (config.state.deviceId !== device)
        throw new UserInputError("Config doesn't belong to device");
      if (config.state.accountId !== account)
        throw new UserInputError("Config doesn't belong to account");
    } else {
      const state = await this.prisma.userState.findFirst({
        ...this.users.latestStateArgs({ account, addr: device }, true),
        select: {
          configs: {
            select: {
              id: true,
            },
            orderBy: {
              approvers: {
                _count: 'asc',
              },
            },
          },
        },
      });
      assert(state);

      configId = state.configs[0].id;
    }

    const r = await this.prisma.proposal.create({
      data: {
        hash,
        account: connectAccount(account),
        proposer: {
          connect: {
            accountId_deviceId: {
              accountId: account,
              deviceId: device,
            },
          },
        },
        config: { connect: { id: configId } },
        to: proposal.to,
        value: proposal.value.toString(),
        data: hexlify(proposal.data),
        salt: proposal.salt,
        gasLimit: proposal.gasLimit?.toString(),
      },
      ...(signature && { select: null }),
    });

    return signature
      ? this.service.approve({
          hash,
          signature,
          executeWhenApproved,
          device,
          args: getSelect(info),
        })
      : r;
  }

  @Mutation(() => Proposal)
  async approve(
    @Args() args: ApproveArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.service.approve({
      ...args,
      device,
      args: getSelect(info),
    });
  }

  @Mutation(() => Proposal, { nullable: true })
  async reject(
    @Args() { hash }: UniqueProposalArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal | null> {
    const proposal = await this.prisma.proposal.update({
      where: { hash },
      data: {
        approvals: {
          upsert: {
            where: {
              proposalHash_deviceId: {
                proposalHash: hash,
                deviceId: device,
              },
            },
            create: {
              device: connectOrCreateDevice(device),
            },
            update: {
              signature: null,
              createdAt: new Date(),
            },
          },
        },
      },
      ...getSelect(info),
    });

    // Delete proposal if no approvals are left
    const approvalsLeft = await this.prisma.approval.count({ where: { proposalHash: hash } });
    if (!approvalsLeft) {
      await this.prisma.proposal.delete({
        where: { hash },
      });
      return null;
    }

    return proposal;
  }

  @Mutation(() => Boolean)
  async requestApproval(
    @Args() { hash, approvers }: ApprovalRequest,
    @DeviceAddr() device: Address,
  ): Promise<true> {
    // Ensure all approvers are valid for the given proposal
    const { accountId, approvals } = await this.prisma.proposal.findUniqueOrThrow({
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
          .filter((user) => !approvals.find((a) => a.deviceId === user.device.id))
          .map((user) => user.device.pushToken)
          .filter(isPresent),
        title: 'Approval Request',
        body: `${user.name} has requested your approval`,
        data: {
          url: `zallo://proposal/?id=${hash}`,
        },
      },
    ]);

    // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications

    return true;
  }
}
