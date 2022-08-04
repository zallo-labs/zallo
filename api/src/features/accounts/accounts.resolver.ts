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
import {
  AccountId,
  DeleteAccountArgs,
  SetAccountNameArgs,
  SetQuorumsArgs as SetAccountQuorumsArgs,
} from './accounts.args';
import {
  connectOrCreateSafe,
  connectOrCreateUser,
} from '~/util/connect-or-create';
import { Account } from '@gen/account/account.model';
import { FindUniqueAccountArgs } from '@gen/account/find-unique-account.args';
import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { Address, getAccountId, hashQuorum, Quorum, toAccountRef } from 'lib';
import { Prisma } from '@prisma/client';
import { UserAddr } from '~/decorators/user.decorator';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() acc: Account): string {
    return getAccountId(acc.safeId, toAccountRef(acc.ref));
  }

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

  @Query(() => [Account])
  async userAccounts(
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account[]> {
    const subAccounts = await this.subgraph.userAccounts(user);

    return this.prisma.account.findMany({
      where: {
        OR: [
          {
            approvers: {
              some: {
                userId: { equals: user },
              },
            },
          },
          ...subAccounts.map(
            ({ safe, accountRef }): Prisma.AccountWhereInput => ({
              safeId: { equals: safe },
              ref: { equals: accountRef },
            }),
          ),
        ],
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
      where: { safeId_ref: id },
      create: {
        safe: connectOrCreateSafe(id.safeId),
        ref: id.ref,
        name,
      },
      update: {
        name: { set: name },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Account, { nullable: true })
  async setAccountQuroums(
    @Args() { id, quorums, txHash }: SetAccountQuorumsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    const existingTxHash = (
      await this.prisma.account.findUnique({
        where: {
          safeId_ref: id,
        },
        select: { txHash: true },
      })
    )?.txHash;

    return this.prisma.account.upsert({
      where: {
        safeId_ref: id,
      },
      create: {
        safe: connectOrCreateSafe(id.safeId),
        ref: id.ref,
        txHash,
        quorums: {
          create: quorums.map((quorum) =>
            this.createQuorum(id, txHash, quorum),
          ),
        },
      },
      update: {
        ...(!existingTxHash && {
          txHash: { set: { txHash } },
        }),
        quorums: {
          connectOrCreate: quorums.map((quorum) => {
            const hash = hashQuorum(quorum);

            return {
              where: {
                safeId_accountRef_hash: {
                  safeId: id.safeId,
                  accountRef: id.ref,
                  hash,
                },
              },
              create: this.createQuorum(id, txHash, quorum),
            };
          }),
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Boolean)
  deleteAccount(@Args() { id }: DeleteAccountArgs): boolean {
    this.prisma.account.delete({
      where: {
        safeId_ref: id,
      },
    });

    return true;
  }

  private createQuorum(
    id: AccountId,
    txHash: string,
    quorum: Quorum,
  ): Prisma.QuorumUncheckedCreateWithoutAccountInput {
    return {
      hash: hashQuorum(quorum),
      txHash,
      approvers: {
        create: quorum.map((approver) => ({
          safe: { connect: { id: id.safeId } },
          account: { connect: { safeId_ref: id } },
          user: connectOrCreateUser(approver),
        })),
      },
    };
  }
}
