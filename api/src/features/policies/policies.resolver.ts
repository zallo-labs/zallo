import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import {
  CreatePolicyInput,
  PoliciesArgs,
  UniquePolicyInput,
  UpdatePolicyInput,
} from './policies.args';
import { PoliciesService } from './policies.service';
import { Policy } from './policies.model';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(
    @Args('args') policy: UniquePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy | null> {
    return this.service.findUnique({
      where: {
        accountId_key: {
          accountId: policy.account,
          key: policy.key,
        },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [Policy])
  async policies(@Args() args: PoliciesArgs, @Info() info: GraphQLResolveInfo): Promise<Policy[]> {
    return this.service.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @ResolveField(() => String)
  id(@Parent() p: Policy): string {
    return `${p.accountId}-${p.key}`;
  }

  @Mutation(() => Policy)
  async createPolicy(
    @Args('args') args: CreatePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy> {
    return this.service.create(args, getSelect(info));
  }

  @Mutation(() => Policy)
  async updatePolicy(
    @Args('args') args: UpdatePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy> {
    return this.service.update(args, getSelect(info));
  }

  @Mutation(() => Policy)
  async removePolicy(
    @Args('args') args: UniquePolicyInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy> {
    return this.service.remove(args, getSelect(info));
  }
}
