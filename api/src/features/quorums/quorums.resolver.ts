import { QuorumState } from '@gen/quorum-state/quorum-state.model';
import { Quorum } from '@gen/quorum/quorum.model';
import { forwardRef, Inject } from '@nestjs/common';
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { ACCOUNT_INTERFACE, Address, QuorumKey, randomQuorumKey } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { UserId } from '~/decorators/user.decorator';
import { connectAccount, connectQuorum } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import { ProposalsService } from '../proposals/proposals.service';
import {
  CreateQuorumArgs,
  QuorumsArgs,
  RemoveQuorumArgs,
  UniqueQuorumArgs,
  UpdateQuorumArgs,
  UpdateQuorumMetadataArgs,
} from './quorums.args';
import { QuorumsService } from './quorums.service';

@Resolver(() => Quorum)
export class QuorumsResolver {
  constructor(
    private service: QuorumsService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
  ) {}

  @Query(() => Quorum, { nullable: true })
  async quorum(
    @Args() { account, key }: UniqueQuorumArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum | null> {
    return this.prisma.quorum.findUnique({
      where: {
        accountId_key: {
          accountId: account,
          key,
        },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [Quorum])
  async quorums(
    @Args() args: QuorumsArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum[]> {
    return this.prisma.quorum.findMany({
      ...args,
      where: {
        AND: [
          {
            states: {
              some: {
                approvers: {
                  some: { userId: user },
                },
              },
            },
          },
          args.where ?? {},
        ],
      },
      ...getSelect(info),
    });
  }

  @ResolveField(() => ID)
  id(@Parent() quorum: Quorum): string {
    return `${quorum.accountId}-${quorum.key}`;
  }

  @ResolveField(() => QuorumState, { nullable: true })
  async activeState(
    @Parent() quorum: Quorum,
    @Info() info: GraphQLResolveInfo,
  ): Promise<QuorumState | null> {
    return this.service.activeState(
      { account: quorum.accountId as Address, key: quorum.key as QuorumKey },
      { ...getSelect(info) },
    );
  }

  @ResolveField(() => [QuorumState])
  async proposedStates(
    @Parent() quorum: Quorum,
    @Info() info: GraphQLResolveInfo,
  ): Promise<QuorumState[]> {
    return this.service.proposedStates(
      { account: quorum.accountId as Address, key: quorum.key as QuorumKey },
      { ...getSelect(info) },
    );
  }

  @Mutation(() => Quorum)
  async createQuorum(
    @Args() args: CreateQuorumArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.prisma.$transaction(async (tx) => {
      // Create quorum
      const key = randomQuorumKey();

      await tx.quorum.create({
        data: {
          accountId: args.account,
          key,
          name: args.name || `Quorum ${key}`,
        },
        select: null,
      });

      // Create quorum state
      return this.service.createUpsertState({
        ...args,
        proposer: user,
        key: randomQuorumKey(),
        tx,
        quorumArgs: getSelect(info),
      });
    });
  }

  @Mutation(() => Quorum)
  async updateQuorum(
    @Args() args: UpdateQuorumArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.prisma.$transaction(async (tx) =>
      this.service.createUpsertState({
        ...args,
        proposer: user,
        proposingQuorumKey: args.proposingQuorumKey ?? args.key,
        tx,
        quorumArgs: getSelect(info),
      }),
    );
  }

  @Mutation(() => Quorum)
  async updateQuorumMetadata(
    @Args() { account, key, name }: UpdateQuorumMetadataArgs,
  ): Promise<Quorum> {
    return this.prisma.quorum.update({
      where: { accountId_key: { accountId: account, key } },
      data: { name },
    });
  }

  @Mutation(() => Quorum)
  async removeQuorum(
    @Args() { account, key, proposingQuorumKey = key }: RemoveQuorumArgs,
    @UserId() user: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Quorum> {
    return this.prisma.$transaction(async (tx) => {
      const { id: proposalId } = await this.proposals.create(
        {
          account,
          data: {
            to: account,
            data: ACCOUNT_INTERFACE.encodeFunctionData('removeQuorum', [key]),
            proposer: { connect: { id: user } },
            quorum: connectQuorum(account, proposingQuorumKey),
          },
          select: {
            id: true,
          },
        },
        tx,
      );

      const r = await tx.quorumState.create({
        data: {
          proposal: { connect: { id: proposalId } },
          account: connectAccount(account),
          quorum: connectQuorum(account, key),
          isRemoved: true,
        },
        select: {
          quorum: { ...getSelect(info) },
        },
      });
      return r.quorum;
    });
  }
}
