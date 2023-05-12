import { Context, Info, Mutation, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  ProposeInput,
  ApproveInput,
  UniqueProposalInput,
  ProposalsInput,
  ProposalSubscriptionInput,
  ProposalSubscriptionPayload,
  PROPOSAL_SUBSCRIPTION,
  ACCOUNT_PROPOSAL_SUB_TRIGGER,
} from './proposals.input';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { TransactionProposal, SatisfiablePolicy } from './proposals.model';
import { ProposalsService } from './proposals.service';
import { getShape } from '../database/database.select';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';
import { Input } from '~/decorators/input.decorator';
import { DatabaseService } from '../database/database.service';
import { Address } from 'lib';

@Resolver(() => TransactionProposal)
export class ProposalsResolver {
  constructor(
    private service: ProposalsService,
    private db: DatabaseService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => TransactionProposal, { nullable: true })
  async proposal(@Input() { hash }: UniqueProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(hash, getShape(info));
  }

  @Query(() => [TransactionProposal])
  async proposals(@Input() input: ProposalsInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.Policy>(() => [SatisfiablePolicy], { id: true })
  async satisfiablePolicies(@Parent() { id }: TransactionProposal): Promise<SatisfiablePolicy[]> {
    return this.service.satisfiablePoliciesResponse(id);
  }

  @Subscription(() => TransactionProposal, {
    name: PROPOSAL_SUBSCRIPTION,
    filter: ({ event }: ProposalSubscriptionPayload, { events }: ProposalSubscriptionInput) => {
      return !events || events.includes(event);
    },
    resolve(
      this: ProposalsResolver,
      { proposal }: ProposalSubscriptionPayload,
      _input,
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
    @Input() { accounts, proposals }: ProposalSubscriptionInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, async () => {
      if (!accounts && !proposals) {
        accounts = (await this.db.query(
          e.select(e.Account, (a) => ({
            filter: e.op(a.id, 'in', e.cast(e.uuid, e.set(...getUserCtx().accounts))),
            address: true,
          })).address,
        )) as Address[];
      }

      return this.pubsub.asyncIterator([
        ...[...(accounts ?? [])].map((account) => `${ACCOUNT_PROPOSAL_SUB_TRIGGER}.${account}`),
        ...[...(proposals ?? [])].map((proposal) => `${PROPOSAL_SUBSCRIPTION}.${proposal}`),
      ]);
    });
  }

  @Mutation(() => TransactionProposal)
  async propose(@Input() input: ProposeInput, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.propose(input);
    return this.service.selectUnique(id, getShape(info));
  }

  @Mutation(() => TransactionProposal)
  async approve(@Input() input: ApproveInput, @Info() info: GraphQLResolveInfo) {
    await this.service.approve(input);
    return this.service.selectUnique(input.hash, getShape(info));
  }

  @Mutation(() => TransactionProposal)
  async reject(@Input() { hash }: UniqueProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.reject(hash);
    return this.service.selectUnique(hash, getShape(info));
  }

  @Mutation(() => Boolean)
  async removeProposal(@Input() { hash }: UniqueProposalInput): Promise<boolean> {
    return this.service.delete(hash);
  }
}
