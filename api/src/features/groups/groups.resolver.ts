import { PrismaService } from 'nestjs-prisma';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { GroupApprover } from '@gen/group-approver/group-approver.model';
import { FindManyGroupArgs } from '@gen/group/find-many-group.args';
import { FindUniqueGroupArgs } from '@gen/group/find-unique-group.args';
import { Group } from '@gen/group/group.model';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/test';
import { UpsertOneGroupArgs } from '@gen/group/upsert-one-group.args';

@Resolver(() => Group)
export class GroupsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Group, { nullable: true })
  async group(
    @Args() args: FindUniqueGroupArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Group | null> {
    return this.prisma.group.findUnique({
      ...args,
      ...getSelect(info),
    });
  }

  @Query(() => [Group])
  async groups(
    @Args() args: FindManyGroupArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Group[]> {
    return this.prisma.group.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @ResolveField(() => String)
  id(@Parent() group: Group): string {
    return `${group.safeId}-${group.hash}`;
  }

  @ResolveField(() => [GroupApprover])
  async approvers(@Parent() group: Group): Promise<GroupApprover[]> {
    return (
      (
        await this.prisma.group.findUnique({
          where: {
            safeId_hash: {
              safeId: group.safeId,
              hash: group.hash,
            },
          },
          select: {
            approvers: {
              include: { approver: true },
            },
          },
        })
      )?.approvers ?? []
    );
  }

  @Mutation(() => Group, { nullable: true })
  async upsertGroup(
    @Args() args: UpsertOneGroupArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Group | null> {
    return this.prisma.group.upsert({
      ...args,
      ...getSelect(info),
    });
  }
}
