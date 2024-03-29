import { Args, Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  CreatePolicyInput,
  PoliciesInput,
  ValidationErrorsArgs,
  UniquePolicyInput,
  UpdatePolicyInput,
  PolicyStateArgs,
} from './policies.input';
import { PoliciesService } from './policies.service';
import {
  CreatePolicyResponse,
  Policy,
  UpdatePolicyResponse,
  ValidationError,
} from './policies.model';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';
import e from '~/edgeql-js';
import { ComputedField } from '~/decorators/computed.decorator';
import { PolicyShape } from './policies.util';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(@Input() policy: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    return this.service.latest(policy, getShape(info));
  }

  @Query(() => Policy, { nullable: true })
  async policyState(@Args() { id }: PolicyStateArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.unique(id, getShape(info));
  }

  @Query(() => [Policy])
  async policies(
    @Input({ defaultValue: {} }) input: PoliciesInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
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
    return r.isOk() ? (await this.service.latest(r.value.id, getShape(info)))! : r.error;
  }

  @Mutation(() => UpdatePolicyResponse)
  async updatePolicy(@Input() input: UpdatePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return (await this.service.latest({ account: input.account, key: input.key }, getShape(info)))!;
  }

  @Mutation(() => Policy)
  async removePolicy(@Input() input: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.remove(input);
    return this.service.latest({ account: input.account, key: input.key }, getShape(info));
  }
}
