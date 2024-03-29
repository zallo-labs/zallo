import { Context, Info, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { InputArgs, Input } from '~/decorators/input.decorator';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { getShape } from '../database/database.select';
import {
  UniqueProposalInput,
  ProposalUpdatedInput,
  ProposalsInput,
  UpdateProposalInput,
} from './proposals.input';
import { Proposal, ProposalUpdated } from './proposals.model';
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
  async proposal(@Input() { id }: UniqueProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(id, getShape(info));
  }

  @Query(() => [Proposal])
  async proposals(
    @Input({ defaultValue: {} }) input: ProposalsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @Mutation(() => Proposal)
  async rejectProposal(@Input() { id }: UniqueProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.reject(id);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => Proposal)
  async updateProposal(@Input() input: UpdateProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return this.service.selectUnique(input.id, getShape(info));
  }

  @Subscription(() => ProposalUpdated, {
    filter: (
      { event }: ProposalSubscriptionPayload,
      { input: { events } }: InputArgs<ProposalUpdatedInput>,
    ) => !events || events.includes(event),
    async resolve(
      this: ProposalsResolver,
      { id, account, event }: ProposalSubscriptionPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return {
        id,
        proposal: await asUser(
          ctx,
          async () => await this.service.selectUnique(id, (p) => getShape(info)(p, 'proposal')),
        ),
        account,
        event,
      };
    },
  })
  async proposalUpdated(
    @Input({ defaultValue: {} }) { proposals, accounts }: ProposalUpdatedInput,
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
