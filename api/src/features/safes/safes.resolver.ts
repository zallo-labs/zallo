import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import { Safe } from '@gen/safe/safe.model';
import { FindManySafeArgs } from '@gen/safe/find-many-safe.args';
import { FindUniqueSafeArgs } from '@gen/safe/find-unique-safe.args';
import { CreateCfSafeArgs, UpsertSafeArgs } from './safes.args';
import { UserAddr } from '~/decorators/user.decorator';
import { getSelect } from '~/util/select';
import { connectOrCreateUser } from '~/util/connect-or-create';

@Resolver(() => Safe)
export class SafesResolver {
  constructor(private prisma: PrismaService) {}

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
    @Args() { safe, deploySalt, name, groups }: UpsertSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    return this.prisma.safe.upsert({
      where: { id: safe },
      create: {
        id: safe,
        deploySalt,
        name,
        ...(groups && {
          groups: {
            create: groups.map((g) => ({
              ref: g.ref,
              name: g.name,
              approvers: {
                create: g.approvers.map((a) => ({
                  user: connectOrCreateUser(a.addr),
                  weight: a.weight,
                })),
              },
            })),
          },
        }),
      },
      update: {
        ...(name && { name: { set: name } }),
        ...(deploySalt && { deploySalt: { set: deploySalt } }),
        ...(groups && {
          groups: {
            upsert: groups.map((g) => ({
              where: {
                safeId_ref: {
                  safeId: safe,
                  ref: g.ref,
                },
              },
              create: {
                ref: g.ref,
                name: g.ref,
                approvers: {
                  create: g.approvers.map((a) => ({
                    user: connectOrCreateUser(a.addr),
                    weight: a.weight,
                  })),
                },
              },
              update: {
                name: { set: g.name },
                approvers: {
                  upsert: g.approvers.map((a) => ({
                    where: {
                      safeId_groupRef_userId: {
                        safeId: safe,
                        groupRef: g.ref,
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
            })),
          },
        }),
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Safe)
  async upsertCounterfactualSafe(
    @Args() { safe, salt, group }: CreateCfSafeArgs,
    @UserAddr() user: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    if (!group.approvers.filter((a) => a.addr === user).length)
      throw new GraphQLError('User must be part of group');

    return await this.prisma.safe.upsert({
      where: { id: safe },
      create: {
        id: safe,
        deploySalt: salt,
        groups: {
          create: {
            ref: group.ref,
            approvers: {
              create: group.approvers.map((a) => ({
                user: connectOrCreateUser(a.addr),
                weight: a.weight.toString(),
              })),
            },
          },
        },
      },
      update: {},
      ...getSelect(info),
    });
  }
}
