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
import { address, Address, isPresent } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { UserId } from '~/decorators/user.decorator';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  UniqueProposalArgs,
  ProposalsArgs,
  ApprovalRequest,
  ProposalSubscriptionFilters,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { Proposal } from '@gen/proposal/proposal.model';
import { ExpoService } from '~/features/util/expo/expo.service';
import { ProposalsService } from './proposals.service';
import { Transaction } from '@gen/transaction/transaction.model';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { getUser } from '~/request/ctx';

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
    return this.service.findUnique({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Proposal])
  async proposals(
    @Args() args: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal[]> {
    return this.service.findMany(args, getSelect(info));
  }

  @ResolveField(() => Transaction, { nullable: true })
  async transaction(@Parent() proposal: Proposal): Promise<Transaction | null> {
    return proposal.transactions ? proposal.transactions[0] : null;
  }

  @Subscription(() => Proposal, {
    name: PROPOSAL_SUBSCRIPTION,
    filter: ({ event }: ProposalSubscriptionPayload, { events }: ProposalSubscriptionFilters) =>
      !events || events.has(event),
  })
  async proposalSubscription(@Args() { accounts, proposals }: ProposalSubscriptionFilters) {
    if (!accounts && !proposals) accounts = getUser().accounts;

    return this.pubsub.asyncIterator([
      ...[...(accounts ?? [])].map((account) => `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${account}`),
      ...[...(proposals ?? [])].map((proposal) => `${PROPOSAL_SUBSCRIPTION}.${proposal}`),
    ]);
  }

  @Mutation(() => Proposal)
  async propose(
    @Args()
    args: ProposeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.service.propose(args, getSelect(info));
  }

  @Mutation(() => Proposal)
  async approve(@Args() args: ApproveArgs, @Info() info: GraphQLResolveInfo): Promise<Proposal> {
    return this.service.approve(args, getSelect(info)!);
  }

  @Mutation(() => Proposal)
  async reject(
    @Args() args: UniqueProposalArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.service.reject(args, { ...getSelect(info) });
  }

  @Mutation(() => Proposal)
  async removeProposal(
    @Args() { id }: UniqueProposalArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.prisma.asUser.proposal.delete({
      where: { id },
      ...getSelect(info),
    });
  }

  // TODO: remove mutation; send notifications on the 1st approval of a proposal
  @Mutation(() => Boolean)
  async requestApproval(
    @Args() { id, approvers }: ApprovalRequest,
    @UserId() user: Address,
  ): Promise<true> {
    const { accountId, quorumKey } = await this.prisma.asUser.proposal.findUniqueOrThrow({
      where: { id },
      select: { accountId: true, quorumKey: true },
    });

    // All approvers should exist for any state of the proposal's quorum
    const quorumState = await this.prisma.asUser.quorumState.findFirst({
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
                pushToken: true, // TODO: fetch as system to bypass RLS
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

    const { name } = await this.prisma.asUser.user.findUniqueOrThrow({ where: { id: user } });

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
