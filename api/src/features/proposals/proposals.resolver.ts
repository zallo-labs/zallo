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
import { address, Address, isPresent, randomTxSalt, toQuorumKey } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { UserId } from '~/decorators/user.decorator';
import { connectOrCreateUser, connectQuorum } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  UniqueProposalArgs,
  ProposalsArgs,
  ApprovalRequest,
  ProposalModifiedArgs,
  ProposalState,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { ProviderService } from '~/provider/provider.service';
import { Proposal } from '@gen/proposal/proposal.model';
import { ExpoService } from '~/expo/expo.service';
import { match } from 'ts-pattern';
import { ProposalWhereInput } from '@gen/proposal/proposal-where.input';
import { ProposalsService, PROPOSAL_SUB } from './proposals.service';
import { Transaction } from '@gen/transaction/transaction.model';
import { PubsubService } from '~/pubsub/pubsub.service';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private service: ProposalsService,
    private prisma: PrismaService,
    private expo: ExpoService,
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
    @Args() { accounts, state, userHasApproved, ...args }: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
    @UserId() user: Address,
  ): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      ...args,
      where: {
        AND: [
          {
            ...(accounts && { accountId: { in: [...accounts] } }),
            ...(state &&
              match<ProposalState, ProposalWhereInput>(state)
                .with(ProposalState.Pending, () => ({
                  transactions: { none: {} },
                }))
                .with(ProposalState.Executing, () => ({
                  transactions: { none: { response: {} } },
                }))
                .with(ProposalState.Executed, () => ({
                  transactions: { some: { response: { is: { success: { equals: true } } } } },
                }))
                .exhaustive()),
            ...(userHasApproved && { approvals: { some: { userId: { equals: user } } } }),
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

  @Mutation(() => Proposal)
  async propose(
    @Args()
    { account, quorumKey, to, value, data, salt = randomTxSalt(), gasLimit }: ProposeArgs,
    @Info() info: GraphQLResolveInfo,
    @UserId() user: Address,
  ): Promise<Proposal> {
    // Default behaviour is specified on ProposeArgs
    if (!quorumKey) {
      const quorum = await this.prisma.quorumState.findFirst({
        where: {
          accountId: account,
          approvers: { some: { userId: user } },
        },
        orderBy: [{ approvers: { _count: 'asc' } }, { id: 'asc' }],
        select: { quorumKey: true },
      });

      if (!quorum) throw new UserInputError(`Device doesn't belong to any quorums`);
      quorumKey = toQuorumKey(quorum.quorumKey);
    }

    return this.service.create({
      account,
      data: {
        proposer: { connect: { id: user } },
        quorum: connectQuorum(account, quorumKey),
        to,
        value: value.toString(),
        data,
        salt,
        gasLimit: gasLimit?.toString(),
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Proposal)
  async approve(
    @Args() args: ApproveArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.service.approve({
      ...args,
      user,
      ...getSelect(info),
    });
  }

  @Mutation(() => Proposal)
  async reject(
    @Args() { id }: UniqueProposalArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    const proposal = await this.prisma.proposal.update({
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
      ...getSelect(info),
    });
    this.service.publishProposal(proposal);

    return proposal;
  }

  @Mutation(() => Boolean)
  async requestApproval(
    @Args() { id, approvers }: ApprovalRequest,
    @UserId() user: Address,
  ): Promise<true> {
    const { accountId, quorumKey } = await this.prisma.proposal.findUniqueOrThrow({
      where: { id },
      select: { accountId: true, quorumKey: true },
    });

    // All approvers should exist for any state of the proposal's quorum
    const quorumState = await this.prisma.quorumState.findFirst({
      where: {
        accountId,
        quorumKey,
        approvers: { some: { userId: { in: [...approvers] } } },
      },
      select: {
        approvers: {
          select: {
            user: {
              select: {
                id: true,
                pushToken: true,
              },
            },
          },
        },
      },
    });

    const approverPushTokens = (quorumState?.approvers ?? [])
      .filter((a) => approvers.has(address(a.user.id)))
      .map((a) => a.user.pushToken);

    if (approverPushTokens.length !== approvers.size)
      throw new UserInputError('All approvers must be part of a state of the quorum');

    const { name } = await this.prisma.user.findUniqueOrThrow({ where: { id: user } });

    // Send a notification to specified users that haven't approved yet
    this.expo.chunkPushNotifications([
      {
        to: approverPushTokens.filter(isPresent),
        title: 'Approval Request',
        body: `${name} has requested your approval`,
        data: { url: `zallo://proposal/?id=${id}` },
      },
    ]);

    // TODO: handle failed notifications, removing push tokens of users that have uninstalled or disabled notifications

    return true;
  }
}
