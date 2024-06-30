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
  CreatePolicyInput,
  ValidationErrorsArgs,
  UniquePolicyInput,
  UpdatePolicyInput,
  UpdatePoliciesInput,
  PolicyUpdatedInput,
} from './policies.input';
import { PoliciesService, PolicyUpdatedPayload } from './policies.service';
import {
  CreatePolicyResponse,
  Policy,
  PolicyUpdated,
  UpdatePolicyResponse,
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

  @Mutation(() => CreatePolicyResponse)
  async createPolicy(
    @Input() input: CreatePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<typeof CreatePolicyResponse> {
    const r = await this.service.create(input);
    return r.isOk() ? (await this.service.latest(r.value, getShape(info)))! : r.error;
  }

  @Mutation(() => UpdatePolicyResponse)
  async updatePolicy(@Input() input: UpdatePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return (await this.service.latest({ account: input.account, key: input.key }, getShape(info)))!;
  }

  @Mutation(() => [Policy])
  async updatePolicies(@Input() input: UpdatePoliciesInput, @Info() info: GraphQLResolveInfo) {
    const policies = await this.service.updatePolicies(input);
    return policies ? this.service.policies(policies, getShape(info)) : [];
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
