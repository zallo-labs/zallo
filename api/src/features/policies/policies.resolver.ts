import { Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.input';
import { PoliciesService } from './policies.service';
import { Policy } from './policies.model';
import { getShape } from '../database/database.select';
import { Input } from '~/decorators/input.decorator';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(@Input() policy: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(policy, getShape(info));
  }

  @Query(() => [Policy])
  async policies(@Info() info: GraphQLResolveInfo) {
    return this.service.select(getShape(info));
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
