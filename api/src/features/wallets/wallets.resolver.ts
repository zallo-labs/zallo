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
  WalletId,
  SetWalletNameArgs,
  SetQuorumsArgs as SetWalletQuorumsArgs,
  WalletArgs,
} from './wallets.args';
import {
  connectOrCreateAccount,
  connectOrCreateUser,
} from '~/util/connect-or-create';
import { Wallet } from '@gen/wallet/wallet.model';
import { FindManyWalletArgs } from '@gen/wallet/find-many-wallet.args';
import { Address, getWalletId, hashQuorum, Quorum, toWalletRef } from 'lib';
import { Prisma } from '@prisma/client';
import { UserAddr } from '~/decorators/user.decorator';
import { SubgraphService } from '../subgraph/subgraph.service';

@Resolver(() => Wallet)
export class WalletsResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() acc: Wallet): string {
    return getWalletId(acc.accountId, toWalletRef(acc.ref));
  }

  @Query(() => Wallet, { nullable: true })
  async wallet(
    @Args() { id }: WalletArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { accountId_ref: id },
      ...getSelect(info),
    });
  }

  @Query(() => [Wallet])
  async wallets(
    @Args() args: FindManyWalletArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @Query(() => [Wallet])
  async userWallets(
    @UserAddr() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Wallet[]> {
    const subWallets = await this.subgraph.userWallets(user);

    return this.prisma.wallet.findMany({
      where: {
        OR: [
          {
            approvers: {
              some: {
                userId: { equals: user },
              },
            },
          },
          ...subWallets.map(
            ({ account, walletRef }): Prisma.WalletWhereInput => ({
              accountId: { equals: account },
              ref: { equals: walletRef },
            }),
          ),
        ],
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Wallet)
  async setWalletName(
    @Args() { id, name }: SetWalletNameArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Wallet> {
    return this.prisma.wallet.upsert({
      where: { accountId_ref: id },
      create: {
        account: connectOrCreateAccount(id.accountId),
        ref: id.ref,
        name,
      },
      update: {
        name: { set: name },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Wallet, { nullable: true })
  async setWalletQuroums(
    @Args() { id, quorums, txHash }: SetWalletQuorumsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Wallet> {
    const existingTxHash = (
      await this.prisma.wallet.findUnique({
        where: {
          accountId_ref: id,
        },
        select: { txHash: true },
      })
    )?.txHash;

    return this.prisma.wallet.upsert({
      where: {
        accountId_ref: id,
      },
      create: {
        account: connectOrCreateAccount(id.accountId),
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
                accountId_walletRef_hash: {
                  accountId: id.accountId,
                  walletRef: id.ref,
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
  deleteWallet(@Args() { id }: WalletArgs): boolean {
    this.prisma.wallet.delete({
      where: {
        accountId_ref: id,
      },
    });

    return true;
  }

  private createQuorum(
    id: WalletId,
    txHash: string,
    quorum: Quorum,
  ): Prisma.QuorumUncheckedCreateWithoutWalletInput {
    return {
      hash: hashQuorum(quorum),
      txHash,
      approvers: {
        create: quorum.map((approver) => ({
          account: { connect: { id: id.accountId } },
          wallet: { connect: { accountId_ref: id } },
          user: connectOrCreateUser(approver),
        })),
      },
    };
  }
}
