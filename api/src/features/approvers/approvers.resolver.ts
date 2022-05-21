import {
  Args,
  Info,
  Mutation,
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
import { GetAddrNameArgs } from './approvers.input';
import { UserAddr } from '~/decorators/user.decorator';
import { UpsertOneApproverArgs } from '@gen/approver/upsert-one-approver.args';

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
    const res = await this.prisma.approver.findUnique({
      where: { id: approver.id },
      select: {
        groups: {
          select: {
            group: {
              select: {
                safe: {
                  ...getSelect(info),
                },
              },
            },
          },
          distinct: 'safeId',
        },
      },
    });

    return res?.groups.flatMap((g) => g.group.safe) ?? [];
  }

  @Query(() => String, { nullable: true })
  async addrName(
    @Args() { addr }: GetAddrNameArgs,
    @UserAddr() user: string,
  ): Promise<string | null> {
    const contact = await this.prisma.contact.findUnique({
      where: {
        approverId_addr: {
          approverId: user,
          addr,
        },
      },
      select: { name: true },
    });

    if (contact) return contact.name;

    const safe = await this.prisma.safe.findUnique({
      where: { id: addr },
      select: { name: true },
    });

    return safe?.name || null;
  }

  @Mutation(() => Approver)
  async upsertApprover(
    @Args() args: UpsertOneApproverArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Approver> {
    return this.prisma.approver.upsert({
      ...args,
      ...getSelect(info),
    });
  }
}
