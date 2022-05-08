import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { ethers } from 'ethers';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import {
  calculateSafeAddress,
  getGroupApproverId,
  getGroupId,
  hashGroup,
} from 'lib';
import { Safe } from '@gen/safe/safe.model';
import { FindManySafeArgs } from '@gen/safe/find-many-safe.args';
import { FindUniqueSafeArgs } from '@gen/safe/find-unique-safe.args';
import { CreateCfSafeArgs } from './safes.args';
import { UserAddr } from '~/decorators/user.decorator';
import { ProviderService } from '../../provider/provider.service';
import { UpdateOneSafeArgs } from '@gen/safe/update-one-safe.args';
import { getSelect } from '~/util/test';

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
  async updateSafe(
    @Args() args: UpdateOneSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    return this.prisma.safe.update({
      ...args,
      ...getSelect(info),
    });
  }

  @Mutation(() => Safe)
  async createCfSafe(
    @UserAddr() user: string,
    @Args() { approvers }: CreateCfSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    if (!approvers.filter((a) => a.addr === user).length)
      throw new GraphQLError('User must be part of group');

    const { addr: safeAddr, salt } = await calculateSafeAddress(
      approvers,
      this.provider.factory,
    );
    const groupHash = hashGroup(approvers);

    return this.prisma.safe.create({
      data: {
        id: safeAddr,
        deploySalt: ethers.utils.hexlify(salt),
        groups: {
          create: {
            id: getGroupId(safeAddr, approvers),
            hash: groupHash,
            approvers: {
              create: approvers.map((a) => ({
                id: getGroupApproverId(safeAddr, groupHash, a),
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
