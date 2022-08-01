import { PrismaService } from 'nestjs-prisma';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { UpsertAccountArgs } from './accounts.args';
import { connectOrCreateSafe } from '~/util/connect-or-create';
import { Account } from '@gen/account/account.model';
import { FindUniqueAccountArgs } from '@gen/account/find-unique-account.args';
import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { getAccountId, hashQuorum, toAccountRef } from 'lib';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Args() args: FindUniqueAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.prisma.account.findUnique({
      ...args,
      ...getSelect(info),
    });
  }

  @Query(() => [Account])
  async accounts(
    @Args() args: FindManyAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @ResolveField(() => String)
  id(@Parent() acc: Account): string {
    return getAccountId(acc.safeId, toAccountRef(acc.ref));
  }

  @Mutation(() => Account, { nullable: true })
  async upsertAccount(
    @Args() { safe, account: { ref, quorums, name } }: UpsertAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.prisma.account.upsert({
      where: {
        safeId_ref: {
          safeId: safe,
          ref,
        },
      },
      create: {
        safe: connectOrCreateSafe(safe),
        ref,
        name,
        quorums: {
          create: quorums.map((quorum) => ({
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
        name: { set: name },
        quorums: {
          connectOrCreate: quorums.map((quorum) => {
            const hash = hashQuorum(quorum);

            return {
              where: {
                safeId_accountRef_hash: {
                  safeId: safe,
                  accountRef: ref,
                  hash,
                },
              },
              create: {
                hash,
                safe: connectOrCreateSafe(safe),
                approvers: {
                  createMany: {
                    data: quorum.map((approver) => ({
                      userId: approver,
                    })),
                  },
                },
              },
            };
          }),
        },
      },
      ...getSelect(info),
    });
  }
}
