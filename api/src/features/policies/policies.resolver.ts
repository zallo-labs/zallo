import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.args';
import { PoliciesService } from './policies.service';
import { Policy } from './policies.model';
import { getShape } from '../database/database.select';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(@Args('args') policy: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(policy, getShape(info));
  }

  @Query(() => [Policy])
  async policies(@Info() info: GraphQLResolveInfo) {
    return this.service.select(getShape(info));
  }

  @Mutation(() => Policy)
  async createPolicy(@Args('args') args: CreatePolicyInput, @Info() info: GraphQLResolveInfo) {
    const { id } = await this.service.create(args);
    return this.service.selectUnique({ id }, getShape(info));
  }

  @Mutation(() => Policy)
  async updatePolicy(@Args('args') args: UpdatePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.update(args);
    return this.service.selectUnique({ account: args.account, key: args.key }, getShape(info));
  }

  @Mutation(() => Policy)
  async removePolicy(@Args('args') args: UniquePolicyInput, @Info() info: GraphQLResolveInfo) {
    await this.service.remove(args);
    return this.service.selectUnique({ account: args.account, key: args.key }, getShape(info));
  }
}
