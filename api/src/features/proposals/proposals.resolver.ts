import { Context, Info, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { InputArgs, Input } from '~/decorators/input.decorator';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { getShape } from '../database/database.select';
import {
  ProposalInput,
  ProposalSubscriptionInput,
  ProposalsInput,
  UpdateProposalInput,
  LabelProposalRiskInput,
} from './proposals.input';
import { Proposal } from './proposals.model';
import {
  ProposalsService,
  ProposalSubscriptionPayload,
  getProposalTrigger,
  getProposalAccountTrigger,
} from './proposals.service';
import { PubsubService } from '../util/pubsub/pubsub.service';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    private service: ProposalsService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => Proposal, { nullable: true })
  async proposal(@Input() { hash }: ProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(hash, getShape(info));
  }

  @Query(() => [Proposal])
  async proposals(
    @Input({ defaultValue: {} }) input: ProposalsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @Mutation(() => Proposal)
  async rejectProposal(@Input() { hash }: ProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.reject(hash);
    return this.service.selectUnique(hash, getShape(info));
  }

  @Mutation(() => Proposal)
  async updateProposal(@Input() input: UpdateProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return this.service.selectUnique(input.hash, getShape(info));
  }

  @Mutation(() => Proposal)
  async labelProposalRisk(
    @Input() input: LabelProposalRiskInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    await this.service.labelProposalRisk(input);
    return this.service.selectUnique(input.hash, getShape(info));
  }

  @Subscription(() => Proposal, {
    name: 'proposal',
    filter: (
      { event }: ProposalSubscriptionPayload,
      { input: { events } }: InputArgs<ProposalSubscriptionInput>,
    ) => !events || events.includes(event),
    resolve(
      this: ProposalsResolver,
      { hash }: ProposalSubscriptionPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, async () => await this.service.selectUnique(hash, getShape(info)));
    },
  })
  async subscribeToProposals(
    @Input({ defaultValue: {} }) { proposals, accounts }: ProposalSubscriptionInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, async () => {
      if (!accounts?.length && !proposals?.length)
        accounts = getUserCtx().accounts.map((a) => a.address);

      return this.pubsub.asyncIterator([
        ...[...(proposals ?? [])].map(getProposalTrigger),
        ...[...(accounts ?? [])].map(getProposalAccountTrigger),
      ]);
    });
  }
}
