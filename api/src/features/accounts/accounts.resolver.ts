import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';

import { Account } from '@gen/account/account.model';
import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import {
  AccountArgs,
  SetAccountNameArgs,
  UpsertAccountArgs as CreateAccountArgs,
} from './accounts.args';
import { getSelect } from '~/util/select';
import { connectOrCreateUser } from '~/util/connect-or-create';
import { Address, hashQuorum } from 'lib';
import { Prisma } from '@prisma/client';
import { UserAddr } from '~/decorators/user.decorator';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Args() { id }: AccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
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

  @Query(() => [Account])
  async userAccounts(
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account[]> {
    const subAccounts = await this.subgraph.userAccounts(user);

    return this.prisma.account.findMany({
      where: {
        OR: [
          { id: { in: subAccounts } },
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

  @Mutation(() => Account)
  async createAccount(
    @Args() { account, deploySalt, impl, name, wallets }: CreateAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.create({
      data: {
        id: account,
        deploySalt,
        impl,
        name,
        ...(wallets && {
          wallets: {
            create: wallets.map(
              (a): Prisma.WalletUncheckedCreateWithoutAccountInput => ({
                ref: a.ref,
                name: a.name,
                quorums: {
                  create: a.quorums.map((quorum) => ({
                    hash: hashQuorum(quorum),
                    approvers: {
                      create: quorum.map((approver) => ({
                        account: { connect: { id: account } },
                        wallet: {
                          connect: {
                            accountId_ref: {
                              accountId: account,
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

  @Mutation(() => Account)
  async setAccountName(
    @Args() { id, name }: SetAccountNameArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.upsert({
      where: { id },
      create: {
        id,
        name,
      },
      update: {
        name: { set: name },
      },
      ...getSelect(info),
    });
  }
}
