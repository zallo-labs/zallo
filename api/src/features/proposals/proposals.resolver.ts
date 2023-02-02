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
import { address, Address, isPresent, isTruthy, toQuorumKey } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { UserId } from '~/decorators/user.decorator';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  UniqueProposalArgs,
  ProposalsArgs,
  ApprovalRequest,
  ProposalSubscriptionFilters,
  ProposalState,
  ProposalEvent,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
} from './proposals.args';
import { UserInputError } from 'apollo-server-core';
import { Proposal } from '@gen/proposal/proposal.model';
import { ExpoService } from '~/features/util/expo/expo.service';
import { match } from 'ts-pattern';
import { ProposalWhereInput } from '@gen/proposal/proposal-where.input';
import { ProposalsService } from './proposals.service';
import { Transaction } from '@gen/transaction/transaction.model';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { getUserContext } from '~/request/ctx';

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
    @Args() { accounts, states, actionRequired, ...args }: ProposalsArgs,
    @Info() info: GraphQLResolveInfo,
    @UserId() user: Address,
  ): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      ...args,
      where: {
        AND: (
          [
            args.where,
            accounts && { accountId: { in: [...accounts] } },
            states && {
              OR: states.map((state) =>
                match<ProposalState, ProposalWhereInput>(state)
                  .with(ProposalState.Pending, () => ({
                    transactions: { none: {} },
                  }))
                  .with(ProposalState.Executing, () => ({
                    transactions: {
                      some: {},
                      none: { response: {} },
                    },
                  }))
                  .with(ProposalState.Executed, () => ({
                    transactions: { some: { response: { is: { success: { equals: true } } } } },
                  }))
                  .exhaustive(),
              ),
            },
            actionRequired !== undefined &&
              (actionRequired
                ? {
                    transactions: { none: {} },
                    quorum: { activeState: { approvers: { some: { userId: user } } } },
                    approvals: { none: { userId: user } },
                  }
                : {
                    NOT: {
                      quorum: { activeState: { approvers: { some: { userId: user } } } },
                      approvals: { none: { userId: user } },
                    },
                  }),
          ] as const
        ).filter(isTruthy),
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...getSelect(info),
    });
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
    if (!accounts && !proposals) accounts = getUserContext().accounts;

    return this.pubsub.asyncIterator([
      ...[...(accounts ?? [])].map((account) => `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${account}`),
      ...[...(proposals ?? [])].map((proposal) => `${PROPOSAL_SUBSCRIPTION}.${proposal}`),
    ]);
  }

  @Mutation(() => Proposal)
  async propose(
    @Args()
    { account, quorumKey, to, value, data, salt, gasLimit, signature }: ProposeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    const user = getUserContext().id;

    // Default behaviour is specified on ProposeArgs
    if (!quorumKey) {
      const quorum = await this.prisma.quorumState.findFirst({
        where: {
          accountId: account,
          approvers: { some: { userId: user } },
          isRemoved: false,
        },
        orderBy: [{ approvers: { _count: 'asc' } }, { id: 'asc' }],
        select: { quorumKey: true },
      });

      if (!quorum) throw new UserInputError('No quorum could be found for this account');
      quorumKey = toQuorumKey(quorum.quorumKey);
    }

    const proposal = await this.service.create({
      quorum: { account, key: quorumKey },
      options: {
        to,
        value,
        data,
        salt,
        gasLimit,
      },
      ...(signature ? { select: { id: true } } : getSelect(info)),
    });

    return signature
      ? this.service.approve({ id: proposal.id, signature, ...getSelect(info) })
      : proposal;
  }

  @Mutation(() => Proposal)
  async approve(@Args() args: ApproveArgs, @Info() info: GraphQLResolveInfo): Promise<Proposal> {
    return this.service.approve({
      ...args,
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
    this.service.publishProposal({ proposal, event: ProposalEvent.update });

    return proposal;
  }

  @Mutation(() => Proposal)
  async removeProposal(
    @Args() { id }: UniqueProposalArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.prisma.proposal.delete({
      where: { id },
      ...getSelect(info),
    });
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
