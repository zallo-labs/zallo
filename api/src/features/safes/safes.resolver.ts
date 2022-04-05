import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { ethers } from 'ethers';

import { getCounterfactualAddress, getGroupApproverId, getGroupHash, getGroupId } from 'lib';
import { Safe } from '@gen/safe/safe.model';
import { Group } from '@gen/group/group.model';
import { FindManySafeArgs } from '@gen/safe/find-many-safe.args';
import { FindUniqueSafeArgs } from '@gen/safe/find-unique-safe.args';
import { CreateCfSafeArgs } from './safes.args';
import { UserAddr } from '~/decorators/userAddr';

@Resolver(() => Safe)
export class SafesResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Safe, { nullable: true })
  async safe(@Args() args: FindUniqueSafeArgs): Promise<Safe | null> {
    return this.prisma.safe.findUnique(args);
  }

  @Query(() => [Safe])
  async safes(@Args() args: FindManySafeArgs): Promise<Safe[]> {
    return this.prisma.safe.findMany(args);
  }

  @ResolveField(() => [Group])
  async groups(@Parent() safe: Safe): Promise<Group[]> {
    return (
      (
        await this.prisma.safe.findUnique({
          where: { id: safe.id },
          select: { groups: true },
        })
      )?.groups ?? []
    );
  }

  @Mutation(() => Safe)
  async createCfSafe(
    @Args() { approvers }: CreateCfSafeArgs,
  ): // @UserAddr() userAddr: string,    // TODO:
  Promise<Safe> {
    if (!approvers.length) throw new Error('Approvers required');

    const userAddr = approvers[0].addr;
    const { addr: safeAddr, salt } = getCounterfactualAddress(userAddr, approvers);

    const groupHash = getGroupHash(approvers);

    return this.prisma.safe.create({
      data: {
        id: safeAddr,
        deploySalt: ethers.utils.hexlify(salt),
        isCf: true,
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
    });
  }
}
