import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
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
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { Proposal, SatisfiablePolicy } from './proposals.model';
import { ProposalsService } from './proposals.service';
import { getShape } from '../database/database.select';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(private service: ProposalsService, private pubsub: PubsubService) {}

  @Query(() => Proposal, { nullable: true })
  async proposal(@Args() { hash }: UniqueProposalArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(hash, getShape(info));
  }

  @Query(() => [Proposal])
  async proposals(@Args() args: ProposalsArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.select(args, getShape(info));
  }

  @ComputedField<typeof e.Policy>(() => [SatisfiablePolicy], { id: true })
  async satisfiablePolicies(
    @Parent() { id }: Proposal,
    @Info() info: GraphQLResolveInfo,
  ): Promise<SatisfiablePolicy[]> {
    return this.service.satisfiablePoliciesResponse(id, getShape(info));
  }

  @Subscription(() => Proposal, {
    name: PROPOSAL_SUBSCRIPTION,
    filter: ({ event }: ProposalSubscriptionPayload, { events }: ProposalSubscriptionFilters) => {
      return !events || events.includes(event);
    },
    resolve(
      this: ProposalsResolver,
      { proposal }: ProposalSubscriptionPayload,
      _args,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(
        ctx,
        async () => await this.service.selectUnique(proposal.hash, getShape(info)),
      );
    },
  })
  async proposalSubscription(
    @Args() { accounts, proposals }: ProposalSubscriptionFilters,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, () => {
      if (!accounts && !proposals) accounts = [...getUserCtx().accounts2.map((a) => a.address)];

      return this.pubsub.asyncIterator([
        ...[...(accounts ?? [])].map((account) => `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${account}`),
        ...[...(proposals ?? [])].map((proposal) => `${PROPOSAL_SUBSCRIPTION}.${proposal}`),
      ]);
    });
  }

  @Mutation(() => Proposal)
  async propose(@Args('args') args: ProposeArgs, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.propose(args);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Proposal)
  async approve(@Args('args') args: ApproveArgs, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.approve(args);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Proposal)
  async reject(@Args() { hash }: UniqueProposalArgs, @Info() info: GraphQLResolveInfo) {
    await this.service.reject(hash);
    return this.service.selectUnique(hash, getShape(info));
  }

  @Mutation(() => Boolean)
  async removeProposal(@Args() { hash }: UniqueProposalArgs): Promise<boolean> {
    return this.service.delete(hash);
  }
}
