import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import _ from 'lodash';

import { Approver } from '@gen/approver/approver.model';
import { Group } from '@gen/group/group.model';
import { Safe } from '@gen/safe/safe.model';
import { FindUniqueApproverArgs } from '@gen/approver/find-unique-approver.args';
import { FindManyApproverArgs } from '@gen/approver/find-many-approver.args';

@Resolver(() => Approver)
export class ApproversResolver {
  constructor(private prisma: PrismaService) {}
  @Query(() => Approver, { nullable: true })
  async approver(@Args() args: FindUniqueApproverArgs): Promise<Approver | null> {
    return this.prisma.approver.findUnique(args);
  }

  @Query(() => [Approver])
  async approvers(@Args() args: FindManyApproverArgs): Promise<Approver[]> {
    return this.prisma.approver.findMany(args);
  }

  @ResolveField(() => [Group])
  async groups(@Parent() approver: Approver): Promise<Group[]> {
    return (
      await this.prisma.groupApprover.findMany({
        where: { approverId: approver.id },
        select: { group: true },
      })
    ).map((g) => g.group);
  }

  @ResolveField(() => [Safe])
  async safes(@Parent() approver: Approver): Promise<Safe[]> {
    const groupIds = (await this.groups(approver)).map((g) => g.id);

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
