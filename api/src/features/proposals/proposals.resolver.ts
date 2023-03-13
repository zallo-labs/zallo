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
import { getUser } from '~/request/ctx';
import { Rejection, SatisfiablePolicy } from './proposals.model';
import { asHex } from 'lib';
import { Approval } from '@gen/approval/approval.model';

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
    return proposal.transactions ? proposal.transactions[0] : null;
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
    proposal: Proposal,
    @Info() info: GraphQLResolveInfo,
  ): Promise<SatisfiablePolicy[]> {
    return this.service.satisfiablePolicies(proposal.id, getSelect(info));
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
