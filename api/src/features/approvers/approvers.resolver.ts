import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { PrismaSelect } from '@paljs/plugins';
import _ from 'lodash';

import { Approver } from '@gen/approver/approver.model';
import { Group } from '@gen/group/group.model';
import { Safe } from '@gen/safe/safe.model';
import { FindUniqueApproverArgs } from '@gen/approver/find-unique-approver.args';
import { FindManyApproverArgs } from '@gen/approver/find-many-approver.args';
import { GraphQLResolveInfo } from 'graphql';

@Resolver(() => Approver)
export class ApproversResolver {
  constructor(private prisma: PrismaService) {}
  @Query(() => Approver, { nullable: true })
  async approver(
    @Args() args: FindUniqueApproverArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Approver | null> {
    return this.prisma.approver.findUnique({
      ...args,
      ...new PrismaSelect(info).value,
    });
  }

  @Query(() => [Approver])
  async approvers(
    @Args() args: FindManyApproverArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Approver[]> {
    return this.prisma.approver.findMany({
      ...args,
      ...new PrismaSelect(info).value,
    });
  }

  @ResolveField(() => [Safe])
  async safes(@Parent() approver: Approver): Promise<Safe[]> {
    const groupIds = approver.groups
      ? approver.groups.map((g) => g.id)
      : (
          await this.prisma.approver.findUnique({
            where: { id: approver.id },
            select: { groups: { select: { groupId: true } } },
          })
        )?.groups.map((g) => g.groupId);

    if (!groupIds) return [];

    const safes = await this.prisma.safe.findMany({
      where: {
        groups: {
          some: {
            id: { in: groupIds },
          },
        },
      },
    });

    return _.map(
      _.groupBy(safes, (safe) => safe.id),
      ([firstSafe]) => firstSafe,
    );
  }
}
