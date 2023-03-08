import { Policy } from '@gen/policy/policy.model';
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import {
  CreatePolicyArgs,
  PoliciesArgs,
  UniquePolicyArgs,
  UpdatePolicyArgs,
} from './policies.args';
import { PoliciesService } from './policies.service';

@Resolver(() => Policy)
export class PoliciesResolver {
  constructor(private service: PoliciesService) {}

  @Query(() => Policy, { nullable: true })
  async policy(
    @Args() policy: UniquePolicyArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy | null> {
    return this.service.findUnique({
      where: {
        accountId_key: {
          accountId: policy.account,
          key: policy.key as bigint,
        },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [Policy])
  async quorums(@Args() args: PoliciesArgs, @Info() info: GraphQLResolveInfo): Promise<Policy[]> {
    return this.service.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @ResolveField(() => ID)
  id(@Parent() quorum: Policy): string {
    return `${quorum.accountId}-${quorum.key}`;
  }

  @Mutation(() => Policy)
  async createPolicy(
    @Args() args: CreatePolicyArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy> {
    return this.service.create(args, getSelect(info));
  }

  @Mutation(() => Policy)
  async updatePolicy(
    @Args() args: UpdatePolicyArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy> {
    return this.service.update(args, getSelect(info));
  }

  @Mutation(() => Policy)
  async removePolicy(
    @Args() args: UniquePolicyArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Policy> {
    return this.service.remove(args, getSelect(info));
  }
}
