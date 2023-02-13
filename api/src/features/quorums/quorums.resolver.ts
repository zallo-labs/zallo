import { QuorumState } from '@gen/quorum-state/quorum-state.model';
import { Quorum } from '@gen/quorum/quorum.model';
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import {
  CreateQuorumArgs,
  QuorumsArgs,
  RemoveQuorumArgs,
  UniqueQuorumArgs,
  UpdateQuorumArgs,
  UpdateQuorumMetadataArgs,
} from './quorums.args';
import { QuorumsService } from './quorums.service';

@Resolver(() => Quorum)
export class QuorumsResolver {
  constructor(private service: QuorumsService) {}

  @Query(() => Quorum, { nullable: true })
  async quorum(
    @Args() quorum: UniqueQuorumArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum | null> {
    return this.service.findUnique({
      where: {
        accountId_key: {
          accountId: quorum.account,
          key: quorum.key,
        },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [Quorum])
  async quorums(@Args() args: QuorumsArgs, @Info() info: GraphQLResolveInfo): Promise<Quorum[]> {
    return this.service.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @ResolveField(() => ID)
  id(@Parent() quorum: Quorum): string {
    return `${quorum.accountId}-${quorum.key}`;
  }

  @ResolveField(() => [QuorumState])
  async proposedStates(
    @Parent() quorum: Quorum,
    @Info() info: GraphQLResolveInfo,
  ): Promise<QuorumState[]> {
    return this.service
      .findUniqueOrThrow({
        where: {
          accountId_key: {
            accountId: quorum.accountId,
            key: quorum.key,
          },
        },
      })
      .states({
        where: { activeStateOfQuorum: null },
        ...getSelect(info),
      });
  }

  @Mutation(() => Quorum)
  async createQuorum(
    @Args() args: CreateQuorumArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.service.create(args, getSelect(info));
  }

  @Mutation(() => Quorum)
  async updateQuorum(
    @Args() args: UpdateQuorumArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.service.update(args, getSelect(info));
  }

  @Mutation(() => Quorum)
  async updateQuorumMetadata(
    @Args() args: UpdateQuorumMetadataArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.service.updateMetadata(args, getSelect(info));
  }

  @Mutation(() => Quorum)
  async removeQuorum(
    @Args() args: RemoveQuorumArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.service.remove(args, getSelect(info));
  }
}
