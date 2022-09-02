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
import { makeGetSelect } from '~/util/select';
import {
  WalletId,
  SetWalletNameArgs,
  WalletArgs,
  UpsertWalletArgs,
  RemoveWalletArgs,
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
import { UserInputError } from 'apollo-server-core';
import { ProposableState, ProposableStatus } from './proposable.args';

const getSelect = makeGetSelect<{
  Wallet: Prisma.WalletSelect;
}>({
  Wallet: {
    accountId: true,
    ref: true,
  },
});

@Resolver(() => Wallet)
export class WalletsResolver {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
  ) {}

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

  @ResolveField(() => String)
  id(@Parent() w: Wallet): string {
    return getWalletId(w.accountId, toWalletRef(w.ref));
  }

  @ResolveField(() => ProposableState, { nullable: true })
  async state(@Parent() w: Wallet): Promise<ProposableState | null> {
    const { createProposal, removeProposal } =
      await this.prisma.wallet.findUniqueOrThrow({
        where: {
          accountId_ref: {
            accountId: w.accountId,
            ref: w.ref,
          },
        },
        select: {
          createProposal: {
            select: {
              hash: true,
              createdAt: true,
              submissions: {
                where: { finalized: true },
              },
            },
          },
          removeProposal: {
            select: {
              hash: true,
              createdAt: true,
              submissions: {
                where: { finalized: true },
              },
            },
          },
        },
      });

    // remove | deleted if it has a removeProposal that is newer than the create proposal
    if (
      removeProposal &&
      (!createProposal || removeProposal.createdAt > createProposal.createdAt)
    ) {
      if (removeProposal.submissions.length) return null;

      return {
        status: ProposableStatus.remove,
        proposedModificationHash: removeProposal.hash,
      };
    }

    // Otherwise, active if the create proposal has a finalized submission otherwise it is added
    if (createProposal?.submissions.length)
      return { status: ProposableStatus.active };

    return {
      status: ProposableStatus.add,
      proposedModificationHash: createProposal?.hash,
    };
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
  async upsertWallet(
    @Args()
    {
      id,
      proposalHash,
      name,
      quorums,
      spendingAllowlisted,
      limits,
    }: UpsertWalletArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Wallet> {
    // Only a single proposal can be active at a time for any given wallet
    // Deleting prior unfinalized proposals related to the wallet will cascade delete a proposed wallet and quorums
    await this.prisma.tx.deleteMany({
      where: {
        ...this.getActiveModificationProposalsWhere(id.accountId, id.ref),
        hash: {
          not: proposalHash,
        },
      },
    });

    return this.prisma.wallet.upsert({
      where: {
        accountId_ref: id,
      },
      create: {
        account: connectOrCreateAccount(id.accountId),
        ref: id.ref,
        createProposal: {
          connect: {
            accountId_hash: {
              accountId: id.accountId,
              hash: proposalHash,
            },
          },
        },
        name,
        quorums: {
          create: quorums.map((quorum) =>
            this.createQuorum(id, proposalHash, quorum),
          ),
        },
        spendingAllowlisted,
        ...(limits && {
          limits: {
            createMany: {
              data: limits?.map((l) => ({
                token: l.token,
                amount: l.amount.toString(),
                period: l.period,
              })),
            },
          },
        }),
      },
      update: {
        ...(name && {
          name: { set: name },
        }),
        quorums: {
          // Mark new quorums as being added by the proposal
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
              create: this.createQuorum(id, proposalHash, quorum),
            };
          }),
          // Mark quorums not included as being deleted by the proposal
          // These quorums are all finalized; unfinalized modification proposals, and thus their quorums, were deleted above
          updateMany: {
            where: {
              hash: {
                notIn: quorums.map((quorum) => hashQuorum(quorum)),
              },
            },
            data: {
              removeProposalAccountId: id.accountId,
              removeProposalHash: proposalHash,
            },
          },
        } as Prisma.QuorumUpdateManyWithoutWalletNestedInput,
        ...(spendingAllowlisted !== undefined && {
          spendingAllowlisted: { set: spendingAllowlisted },
        }),
        ...(limits && {
          limits: {
            connectOrCreate: limits.map((l) => ({
              where: {
                accountId_walletRef_token: {
                  accountId: id.accountId,
                  walletRef: id.ref,
                  token: l.token,
                },
              },
              create: {
                token: l.token,
                amount: l.amount.toString(),
                period: l.period,
              },
            })),
          },
        }),
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => Boolean)
  async deleteWallet(
    @Args() { id, proposalHash }: RemoveWalletArgs,
  ): Promise<boolean> {
    const isActive = (
      await this.prisma.wallet.findUniqueOrThrow({
        where: {
          accountId_ref: id,
        },
        select: {
          createProposal: {
            select: {
              submissions: {
                where: {
                  finalized: true,
                },
                select: {
                  txHash: true,
                },
              },
            },
          },
        },
      })
    ).createProposal?.submissions.length;

    // Propose deletion if it's active, otherwise delete
    if (isActive) {
      // Active; mark delete as occuring upon tx execution
      if (!proposalHash)
        throw new UserInputError("Can't delete active wallet without txHash");

      this.prisma.wallet.update({
        where: {
          accountId_ref: id,
        },
        data: {
          removeProposalHash: { set: proposalHash },
        },
      });
    } else {
      // Proposed; delete
      this.prisma.wallet.delete({
        where: {
          accountId_ref: id,
        },
      });
    }

    return true;
  }

  private createQuorum(
    id: WalletId,
    createProposalHash: string,
    quorum: Quorum,
  ): Prisma.QuorumUncheckedCreateWithoutWalletInput {
    return {
      hash: hashQuorum(quorum),
      createProposalHash,
      approvers: {
        create: quorum.map((approver) => ({
          account: { connect: { id: id.accountId } },
          wallet: { connect: { accountId_ref: id } },
          user: connectOrCreateUser(approver),
        })),
      },
    };
  }

  private getActiveModificationProposalsWhere(
    accountId: string,
    walletRef: string,
  ): Prisma.TxWhereInput {
    return {
      accountId: accountId,
      walletRef,
      submissions: {
        none: {
          finalized: true,
        },
      },
      OR: [
        {
          proposedCreateWallet: {
            ref: walletRef,
          },
        },
        {
          proposedRemoveWallet: {
            ref: walletRef,
          },
        },
        {
          proposedCreateQuroums: {
            some: {
              walletRef,
            },
          },
        },
        {
          proposedRemoveQuroums: {
            some: {
              walletRef,
            },
          },
        },
      ],
    };
  }
}
