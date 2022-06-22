import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { ethers } from 'ethers';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import {
  address,
  calculateSafeAddress,
  getApproverId,
  Group,
  getGroupId,
  toSafeConstructorDeployArgs,
} from 'lib';
import { Safe } from '@gen/safe/safe.model';
import { FindManySafeArgs } from '@gen/safe/find-many-safe.args';
import { FindUniqueSafeArgs } from '@gen/safe/find-unique-safe.args';
import { CreateCfSafeArgs } from './safes.args';
import { UserAddr } from '~/decorators/user.decorator';
import { ProviderService } from '../../provider/provider.service';
import { getSelect } from '~/util/test';
import { UpsertOneSafeArgs } from '@gen/safe/upsert-one-safe.args';

@Resolver(() => Safe)
export class SafesResolver {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
  ) {}

  @Query(() => Safe, { nullable: true })
  async safe(
    @Args() args: FindUniqueSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe | null> {
    return this.prisma.safe.findUnique({
      ...args,
      ...getSelect(info),
    });
  }

  @Query(() => [Safe])
  async safes(
    @Args() args: FindManySafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe[]> {
    return this.prisma.safe.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @Mutation(() => Safe)
  async upsertSafe(
    @Args() args: UpsertOneSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    return this.prisma.safe.upsert({
      ...args,
      ...getSelect(info),
    });
  }

  @Mutation(() => Safe)
  async createCfSafe(
    @UserAddr() user: string,
    @Args() { group }: CreateCfSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    if (!group.approvers.filter((a) => a.addr === user).length)
      throw new GraphQLError('User must be part of group');

    const { addr: safe, salt } = await calculateSafeAddress(
      toSafeConstructorDeployArgs({ group }),
      this.provider.factory,
    );

    return this.prisma.safe.create({
      data: {
        id: safe,
        deploySalt: ethers.utils.hexlify(salt),
        groups: {
          create: {
            id: getGroupId(safe, group.ref),
            approvers: {
              create: group.approvers.map((a) => ({
                id: getApproverId(safe, group.ref, a.addr),
                approver: {
                  connectOrCreate: {
                    where: { id: a.addr },
                    create: { id: a.addr },
                  },
                },
                weight: a.weight.toString(),
              })),
            },
          },
        },
      },
      ...getSelect(info),
    });
  }
}
