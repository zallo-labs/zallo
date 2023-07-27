import {
  Context,
  ID,
  Info,
  Mutation,
  Parent,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  ProposeInput,
  ApproveInput,
  ProposalInput,
  ProposalsInput,
  ProposalSubscriptionInput,
  UpdateProposalInput,
} from './proposals.input';
import { PubsubService } from '~/features/util/pubsub/pubsub.service';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { TransactionProposal, TransactionProposalStatus } from './proposals.model';
import {
  ProposalSubscriptionPayload,
  ProposalsService,
  getProposalAccountTrigger,
  getProposalTrigger,
} from './proposals.service';
import { getShape } from '../database/database.select';
import e from '~/edgeql-js';
import { Input, InputArgs } from '~/decorators/input.decorator';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { ComputedField } from '~/decorators/computed.decorator';

@Resolver(() => TransactionProposal)
export class ProposalsResolver {
  constructor(private service: ProposalsService, private pubsub: PubsubService) {}

  @Query(() => TransactionProposal, { nullable: true })
  async proposal(@Input() { hash }: ProposalInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(hash, getShape(info));
  }

  @Query(() => [TransactionProposal])
  async proposals(
    @Input({ defaultValue: {} }) input: ProposalsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.TransactionProposal>(() => Boolean, { status: true })
  async updatable(@Parent() { status }: TransactionProposal): Promise<boolean> {
    return (
      status === TransactionProposalStatus.Pending || status === TransactionProposalStatus.Failed
    );
  }

  @Subscription(() => TransactionProposal, {
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
  async reject(@Input() { hash }: ProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.reject(hash);
    return this.service.selectUnique(hash, getShape(info));
  }

  @Mutation(() => TransactionProposal)
  async updateProposal(@Input() input: UpdateProposalInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return this.service.selectUnique(input.hash, getShape(info));
  }

  @Mutation(() => ID, { nullable: true })
  async removeProposal(@Input() { hash }: ProposalInput): Promise<uuid | null> {
    return this.service.delete(hash);
  }
}
