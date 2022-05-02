import { PrismaService } from 'nestjs-prisma';
import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';

import { GroupApprover } from '@gen/group-approver/group-approver.model';
import { FindManyGroupArgs } from '@gen/group/find-many-group.args';
import { FindUniqueGroupArgs } from '@gen/group/find-unique-group.args';
import { Group } from '@gen/group/group.model';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaSelect } from '@paljs/plugins';

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
      ...new PrismaSelect(info).value,
    });
  }

  @Query(() => [Group])
  async groups(
    @Args() args: FindManyGroupArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Group[]> {
    return this.prisma.group.findMany({
      ...args,
      ...new PrismaSelect(info).value,
    });
  }

  @ResolveField(() => [GroupApprover])
  async approvers(@Parent() group: Group): Promise<GroupApprover[]> {
    const r = await this.prisma.groupApprover.findMany({
      where: { groupId: group.id },
      include: { approver: true },
    });

    // return r;

    return r.map((group) => ({
      ...group,
      weight: group.weight.toHex() as any as Decimal,
    }));
  }
}
