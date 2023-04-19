import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import {
  ProposeArgs,
  ApproveArgs,
  UniqueProposalArgs,
  ProposalsArgs,
  ProposalSubscriptionFilters,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
} from './proposals.args';
import { Proposal } from '@gen/proposal/proposal.model';
import { ProposalsService } from './proposals.service';
import { Transaction } from '@gen/transaction/transaction.model';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { asUser, getUserCtx, userFromGraphqlContext } from '~/request/ctx';
import { Rejection, SatisfiablePolicy } from './proposals.model';
import { asHex } from 'lib';
import { Approval } from '@gen/approval/approval.model';
import { ExplorerTransfer } from '../explorer/explorer.model';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(private service: ProposalsService, private pubsub: PubsubService) {}

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
    return proposal.transactions?.[0] || null;
  }

  @ResolveField(() => [Approval])
  async approvals(@Parent() proposal: Proposal): Promise<Approval[]> {
    return (
      (proposal.approvals ?? [])
        ?.filter((approval) => approval.signature)
        .map((a) => ({ ...a, signature: asHex(a.signature!) })) ?? []
    );
  }

  @ResolveField(() => [Rejection])
  async rejections(@Parent() proposal: Proposal): Promise<Rejection[]> {
    return (proposal.approvals ?? []).filter((approval) => !approval.signature);
  }

  @ResolveField(() => [SatisfiablePolicy])
  async satisfiablePolicies(
    @Parent() proposal: Proposal,
    @Info() info: GraphQLResolveInfo,
  ): Promise<SatisfiablePolicy[]> {
    return this.service.satisfiablePolicies(proposal.id, getSelect(info));
  }

  @ResolveField(() => [ExplorerTransfer])
  async transfers(@Parent() proposal: Proposal): Promise<ExplorerTransfer[]> {
    return this.service.transfers(proposal);
  }

  @Subscription(() => Proposal, {
    name: PROPOSAL_SUBSCRIPTION,
    filter: ({ event }: ProposalSubscriptionPayload, { events }: ProposalSubscriptionFilters) => {
      console.log('Filtering proposal subscription');
      return !events || events.includes(event);
    },
    resolve(
      this: ProposalsResolver,
      { proposal }: ProposalSubscriptionPayload,
      _args,
      ctx,
      info: GraphQLResolveInfo,
    ) {
      return asUser(
        userFromGraphqlContext(ctx),
        async () =>
          await this.service.findUnique({ where: { id: proposal.id }, ...getSelect(info) }),
      );
    },
  })
  async proposalSubscription(@Args() { accounts, proposals }: ProposalSubscriptionFilters) {
    if (!accounts && !proposals) accounts = [...getUserCtx().accounts];

    console.log(
      `Subscribing: ${JSON.stringify([
        ...[...(accounts ?? [])].map((account) => `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${account}`),
        ...[...(proposals ?? [])].map((proposal) => `${PROPOSAL_SUBSCRIPTION}.${proposal}`),
      ])}`,
    );

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
    return this.service.approve(args, getSelect(info));
  }

  @Mutation(() => Proposal)
  async reject(
    @Args() args: UniqueProposalArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Proposal> {
    return this.service.reject(args, getSelect(info));
  }

  @Mutation(() => Proposal)
  async removeProposal(
    @Args() args: UniqueProposalArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<Proposal>> {
    return this.service.delete(args, getSelect(info));
  }
}
