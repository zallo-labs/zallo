import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { address, Address, hashTx, isPresent, randomTxSalt } from 'lib';
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
  ProposalModifiedArgs,
  ProposalState,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';
import { Proposal } from '@gen/proposal/proposal.model';
import { ExpoService } from '~/expo/expo.service';
import { match } from 'ts-pattern';
import { ProposalWhereInput } from '@gen/proposal/proposal-where.input';
import { UsersService } from '../users/users.service';
import { ProposalsService } from './proposals.service';
import { Transaction } from '@gen/transaction/transaction.model';
import { PubsubService } from '~/pubsub/pubsub.service';

const PROPOSAL_SUB = 'proposal';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private service: ProposalsService,
    private prisma: PrismaService,
    private provider: ProviderService,
    private expo: ExpoService,
    private users: UsersService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => Proposal, { nullable: true })
  async proposal(
    @Args() { id }: UniqueProposalArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal | null> {
    return this.prisma.proposal.findUnique({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Proposal])
  async proposals(
    @Args() { accounts, status, state, ...args }: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      ...args,
      where: {
        AND: [
          {
            ...(accounts && { accountId: { in: [...accounts] } }),
            ...(status &&
              match<ProposalStatus, ProposalWhereInput>(status)
                .with(ProposalStatus.Executed, () => ({
                  transactions: {
                    some: { response: { is: { success: { equals: true } } } },
                  },
                }))
                .with(ProposalStatus.AwaitingUser, () => ({
                  transactions: {
                    none: { response: { is: { success: { equals: true } } } },
                  },
                  approvals: {
                    none: { deviceId: { equals: device } },
                  },
                }))
                .with(ProposalStatus.AwaitingOther, () => ({
                  transactions: {
                    none: { response: { is: { success: { equals: true } } } },
                  },
                  approvals: {
                    some: { deviceId: { equals: device } },
                  },
                }))
                .exhaustive()),
            ...(state &&
              match<ProposalState, ProposalWhereInput>(state)
                .with(ProposalState.Pending, () => ({
                  transactions: { none: {} },
                }))
                .with(ProposalState.Executing, () => ({
                  transactions: {
                    some: { response: { isNot: {} } },
                  },
                }))
                .with(ProposalState.Executed, () => ({
                  transactions: {
                    some: { response: { is: { success: { equals: true } } } },
                  },
                }))
                .exhaustive()),
          },
          args.where ?? {},
        ],
      },
      ...getSelect(info),
    });
  }

  @ResolveField(() => Transaction, { nullable: true })
  async transaction(@Parent() proposal: Proposal): Promise<Transaction | null> {
    return proposal.transactions ? proposal.transactions[proposal.transactions.length - 1] : null;
  }

  @Subscription(() => Proposal, {
    name: PROPOSAL_SUB,
    filter: (
      { proposalModified }: { proposalModified: Proposal },
      { accounts, ids, created }: ProposalModifiedArgs,
    ) => {
      const mAccounts = !accounts || accounts.has(address(proposalModified.accountId));
      const mIds = !ids || ids.has(proposalModified.id);
      const mCreated = created && (proposalModified.approvals?.length ?? 0) === 0;

      return mAccounts && (mIds || mCreated);
    },
  })
  async proposalModified(@Args() _args: ProposalModifiedArgs) {
    return this.pubsub.asyncIterator(PROPOSAL_SUB);
  }

  private publishProposal(proposal: Proposal) {
    this.pubsub.publish(PROPOSAL_SUB, { [PROPOSAL_SUB]: proposal });
  }

  @Mutation(() => Proposal)
  async propose(
    @Args()
    { account, config, to, value, data, salt = randomTxSalt(), gasLimit }: ProposeArgs,
    @Info() info: GraphQLResolveInfo,
    @DeviceAddr() device: Address,
  ): Promise<Proposal> {
    const id = await hashTx(
      { to, value, data, salt },
      { address: account, provider: this.provider },
    );

    // Default behaviour is specified on ProposeArgs
    const state = await this.prisma.userState.findFirst({
      ...this.users.latestStateArgs({ account, addr: device }, null),
      select: {
        configs: {
          select: {
            id: true,
          },
          orderBy: [{ approvers: { _count: 'asc' } }, { id: 'asc' }],
        },
      },
    });
    if (!state) throw new UserInputError(`Device doesn't belong to any configs`);
    config = state.configs[0].id;

    const proposal = await this.prisma.proposal.create({
      data: {
        id,
        account: connectAccount(account),
        proposer: {
          connect: {
            accountId_deviceId: {
              accountId: account,
              deviceId: device,
            },
          },
        },
        config: { connect: { id: config } },
        to,
        value: value.toString(),
        data,
        salt,
        gasLimit: gasLimit?.toString(),
      },
      ...getSelect(info),
    });
    this.publishProposal(proposal);

    return proposal;
  }

  @Mutation(() => Proposal)
  async approve(
    @Args() args: ApproveArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    const proposal = await this.service.approve({
      ...args,
      device,
      args: getSelect(info),
    });
    this.publishProposal(proposal);

    return proposal;
  }

  @Mutation(() => Proposal)
  async reject(
    @Args() { id }: UniqueProposalArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    const proposal = await this.prisma.proposal.update({
      where: { id },
      data: {
        approvals: {
          upsert: {
            where: {
              proposalId_deviceId: {
                proposalId: id,
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
    this.publishProposal(proposal);

    return proposal;
  }

  @Mutation(() => Boolean)
  async requestApproval(
    @Args() { id, approvers }: ApprovalRequest,
    @DeviceAddr() device: Address,
  ): Promise<true> {
    // Ensure all approvers are valid for the given proposal
    const { accountId, approvals } = await this.prisma.proposal.findUniqueOrThrow({
      where: { id },
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
          url: `zallo://proposal/?id=${id}`,
        },
      },
    ]);

    // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications

    return true;
  }
}
