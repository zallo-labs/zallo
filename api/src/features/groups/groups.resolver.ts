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

import { FindManyGroupArgs } from '@gen/group/find-many-group.args';
import { FindUniqueGroupArgs } from '@gen/group/find-unique-group.args';
import { Group } from '@gen/group/group.model';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { UpsertOneGroupArgs } from '@gen/group/upsert-one-group.args';
import { getGroupId } from 'lib';
import { UpsertGroupArgs } from './groups.args';
import {
  connectOrCreateSafe,
  connectOrCreateUser,
} from '~/util/connect-or-create';

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
    return getGroupId(group.safeId, group.ref);
  }

  @Mutation(() => Group, { nullable: true })
  async upsertGroup(
    @Args() { safe, group: { ref, approvers, name } }: UpsertGroupArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Group | null> {
    return this.prisma.group.upsert({
      where: {
        safeId_ref: {
          safeId: safe,
          ref,
        },
      },
      create: {
        safe: connectOrCreateSafe(safe),
        ref,
        name,
        approvers: {
          createMany: {
            data: approvers.map((a) => ({
              userId: a.addr,
              weight: a.weight,
            })),
          },
        },
      },
      update: {
        name: { set: name ?? null },
        approvers: {
          upsert: approvers.map((a) => ({
            where: {
              safeId_groupRef_userId: {
                safeId: safe,
                groupRef: ref,
                userId: a.addr,
              },
            },
            create: {
              user: connectOrCreateUser(a.addr),
              weight: a.weight,
            },
            update: {
              weight: { set: a.weight },
            },
          })),
        },
      },
      ...getSelect(info),
    });
  }
}
