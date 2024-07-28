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
  ValidationErrorsArgs,
  UniquePolicyInput,
  UpdatePolicyDetailsInput,
  PolicyUpdatedInput,
  ProposePoliciesInput,
} from './policies.input';
import { PoliciesService, PolicyUpdatedPayload } from './policies.service';
import {
  NameTaken,
  Policy,
  PolicyUpdated,
  UpdatePolicyDetailsResponse,
  ValidationError,
} from './policies.model';
import { getShape } from '~/core/database';
import { Input, InputArgs } from '~/common/decorators/input.decorator';
import e from '~/edgeql-js';
import { ComputedField } from '~/common/decorators/computed.decorator';
import { PolicyShape } from './policies.util';
import { GqlContext } from '~/core/apollo/ctx';
import { asUser } from '~/core/context';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(@Input() policy: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    return this.service.latest(policy, getShape(info));
  }

  @ComputedField<typeof e.Policy>(() => [ValidationError], PolicyShape)
  async validationErrors(
    @Args() { proposal }: ValidationErrorsArgs,
    @Parent() policy: PolicyShape,
  ): Promise<ValidationError[]> {
    return this.service.validateProposal(proposal, policy);
  }

  @Mutation(() => [Policy])
  async proposePolicies(@Input() input: ProposePoliciesInput, @Info() info: GraphQLResolveInfo) {
    const policies = await this.service.propose(input);
    return this.service.policies(
      policies.map((p) => p.id),
      getShape(info),
    );
  }

  @Mutation(() => UpdatePolicyDetailsResponse, { nullable: true })
  async updatePolicyDetails(
    @Input() input: UpdatePolicyDetailsInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UpdatePolicyDetailsResponse | null> {
    const r = await this.service.updateDetails(input);
    if (!r || r instanceof NameTaken) return r || null;

    return this.service.latest({ account: input.account, key: input.key }, getShape(info));
  }

  @Mutation(() => Policy)
  async removePolicy(@Input() input: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.remove(input);
    return this.service.latest({ account: input.account, key: input.key }, getShape(info));
  }

  @Subscription(() => PolicyUpdated, {
    filter: (
      { event }: PolicyUpdatedPayload,
      { input: { events } }: InputArgs<PolicyUpdatedInput>,
    ) => !events || events.includes(event),
    resolve(
      this: PoliciesResolver,
      p: PolicyUpdatedPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, async () => ({
        id: `${p.policyId}:${p.event}`,
        event: p.event,
        account: p.account,
        policy: await this.service.selectUnique(p.policyId, (p) => getShape(info)(p, 'policy')),
      }));
    },
  })
  async policyUpdated(
    @Input({ defaultValue: {} }) input: PolicyUpdatedInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, () => this.service.subscribe(input.accounts));
  }
}
