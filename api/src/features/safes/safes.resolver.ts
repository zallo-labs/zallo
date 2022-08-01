import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';

import { Safe } from '@gen/safe/safe.model';
import { FindManySafeArgs } from '@gen/safe/find-many-safe.args';
import { FindUniqueSafeArgs } from '@gen/safe/find-unique-safe.args';
import { UpsertSafeArgs } from './safes.args';
import { getSelect } from '~/util/select';
import {
  connectOrCreateSafe,
  connectOrCreateUser,
} from '~/util/connect-or-create';
import { hashQuorum } from 'lib';
import { AccountCreateWithoutSafeInput } from '@gen/account/account-create-without-safe.input';
import { QuorumCreateWithoutAccountInput } from '@gen/quorum/quorum-create-without-account.input';
import { ApproverCreateNestedManyWithoutQuorumInput } from '@gen/approver/approver-create-nested-many-without-quorum.input';
import { ApproverCreateWithoutQuorumInput } from '@gen/approver/approver-create-without-quorum.input';
import { QuorumCreateOrConnectWithoutAccountInput } from '@gen/quorum/quorum-create-or-connect-without-account.input';

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
    @Args() { safe, deploySalt, impl, name, accounts }: UpsertSafeArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Safe> {
    return this.prisma.safe.upsert({
      where: { id: safe },
      create: {
        id: safe,
        deploySalt,
        impl,
        name,
        ...(accounts && {
          accounts: {
            create: accounts.map((a) => ({
              ref: a.ref,
              name: a.name,
              quorums: {
                // QuorumCreateNestedManyWithoutAccountInput
                create: a.quorums.map((quorum) => ({
                  // ApproverUncheckedCreateNestedManyWithoutQuorumInput
                  hash: hashQuorum(quorum),
                  approvers: {
                    create: quorum.map(
                      (approver): ApproverCreateWithoutQuorumInput => ({
                        safe: {
                          connect: { id: safe },
                        },
                        account: {
                          connect: {
                            safeId_ref: {
                              safeId: safe,
                              ref: a.ref,
                            },
                          },
                        },
                        user: connectOrCreateUser(approver),
                      }),
                    ),
                  },
                })),
              },
            })),
          },
        }),
      },
      update: {
        ...(name && { name: { set: name } }),
        ...(deploySalt && { deploySalt: { set: deploySalt } }),
        ...(impl && { impl: { set: impl } }),
        ...(accounts && {
          accounts: {
            upsert: accounts.map((a) => ({
              where: {
                safeId_ref: {
                  safeId: safe,
                  ref: a.ref,
                },
              },
              create: {
                ref: a.ref,
                name: a.ref,
                quorums: {
                  create: a.quorums.map((quorum) => ({
                    hash: hashQuorum(quorum),
                    approvers: {
                      createMany: {
                        data: quorum.map((approver) => ({
                          userId: approver,
                        })),
                      },
                    },
                  })),
                },
              },
              update: {
                name: { set: a.name },
                quorums: {
                  connectOrCreate: a.quorums.map(
                    (q): QuorumCreateOrConnectWithoutAccountInput => {
                      const hash = hashQuorum(q);

                      return {
                        where: {
                          safeId_accountRef_hash: {
                            safeId: safe,
                            accountRef: a.ref,
                            hash,
                          },
                        },
                        create: {
                          safe: connectOrCreateSafe(safe),
                          hash,
                          approvers: {
                            createMany: {
                              data: q.map((approver) => ({
                                userId: approver,
                              })),
                            },
                          },
                        },
                      };
                    },
                  ),
                },
              },
            })),
          },
        }),
      },
      ...getSelect(info),
    });
  }
}
