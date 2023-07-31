import { Info, Mutation, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  CreatePolicyInput,
  PoliciesInput,
  SatisfiabilityInput,
  UniquePolicyInput,
  UpdatePolicyInput,
} from './policies.input';
import { PoliciesService } from './policies.service';
import { Policy, SatisfiabilityResult } from './policies.model';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';
import e from '~/edgeql-js';
import { ComputedField } from '~/decorators/computed.decorator';
import { policyStateShape } from '../policies/policies.util';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(@Input() policy: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(policy, getShape(info));
  }

  @Query(() => [Policy])
  async policies(
    @Input({ defaultValue: {} }) input: PoliciesInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.Policy>(() => SatisfiabilityResult, {
    key: true,
    state: policyStateShape,
  })
  async satisfiability(
    @Input() { proposal }: SatisfiabilityInput,
    @Parent() { key, state }: Policy,
  ): Promise<SatisfiabilityResult> {
    return this.service.satisfiability(proposal, key, state || null);
  }

  @Mutation(() => Policy)
  async createPolicy(@Input() input: CreatePolicyInput, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.create(input);
    return this.service.selectUnique({ id }, getShape(info));
  }

  @Mutation(() => Policy)
  async updatePolicy(@Input() input: UpdatePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(input);
    return this.service.selectUnique({ account: input.account, key: input.key }, getShape(info));
  }

  @Mutation(() => Policy)
  async removePolicy(@Input() input: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.remove(input);
    return this.service.selectUnique({ account: input.account, key: input.key }, getShape(info));
  }
}
