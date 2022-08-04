import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';

import { Safe } from '@gen/safe/safe.model';
import { FindManySafeArgs } from '@gen/safe/find-many-safe.args';
import { SafeArgs, UpsertSafeArgs as CreateSafeArgs } from './safes.args';
import { getSelect } from '~/util/select';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { Address, hashQuorum } from 'lib';
import { Prisma } from '@prisma/client';
import { UserAddr } from '~/decorators/user.decorator';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => Safe)
export class SafesResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

  @Query(() => Safe, { nullable: true })
  async safe(
    @Args() { id }: SafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe | null> {
    return this.prisma.safe.findUnique({
      where: { id },
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

  @Query(() => [Safe])
  async userSafes(
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe[]> {
    const subSafes = await this.subgraph.userSafes(user);

    return this.prisma.safe.findMany({
      where: {
        OR: [
          { id: { in: subSafes } },
          {
            approvers: {
              some: {
                userId: user,
              },
            },
          },
        ],
      },
      distinct: 'id',
      ...getSelect(info),
    });
  }

  @Mutation(() => Safe)
  async createSafe(
    @Args() { safe, deploySalt, impl, name, accounts }: CreateSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    return this.prisma.safe.create({
      data: {
        id: safe,
        deploySalt,
        impl,
        name,
        ...(accounts && {
          accounts: {
            create: accounts.map(
              (a): Prisma.AccountUncheckedCreateWithoutSafeInput => ({
                ref: a.ref,
                name: a.name,
                quorums: {
                  create: a.quorums.map((quorum) => ({
                    hash: hashQuorum(quorum),
                    approvers: {
                      create: quorum.map((approver) => ({
                        safe: { connect: { id: safe } },
                        account: {
                          connect: {
                            safeId_ref: {
                              safeId: safe,
                              ref: a.ref,
                            },
                          },
                        },
                        user: connectOrCreateUser(approver),
                      })),
                    },
                  })),
                },
              }),
            ),
          },
        }),
      },
      ...getSelect(info),
    });
  }
}
