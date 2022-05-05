import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';

import { Approver } from '@gen/approver/approver.model';
import { Safe } from '@gen/safe/safe.model';
import { FindUniqueApproverArgs } from '@gen/approver/find-unique-approver.args';
import { FindManyApproverArgs } from '@gen/approver/find-many-approver.args';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/test';

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
      ...getSelect(info),
    });
  }

  @Query(() => [Approver])
  async approvers(
    @Args() args: FindManyApproverArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Approver[]> {
    return this.prisma.approver.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @ResolveField(() => [Safe])
  async safes(
    @Parent() approver: Approver,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe[]> {
    const groupIds =
      approver.groups?.map((g) => g.groupId) ??
      (
        await this.prisma.approver.findUnique({
          where: { id: approver.id },
          select: { groups: { select: { groupId: true } } },
        })
      )?.groups.map((g) => g.groupId);

    if (!groupIds) return [];

    return await this.prisma.safe.findMany({
      where: {
        groups: {
          some: {
            id: { in: groupIds },
          },
        },
      },
      distinct: 'id',
      ...getSelect(info),
    });
  }
}
