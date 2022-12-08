import { QuorumState } from '@gen/quorum-state/quorum-state.model';
import { Quorum } from '@gen/quorum/quorum.model';
import { forwardRef, Inject } from '@nestjs/common';
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { ACCOUNT_INTERFACE, Address, QuorumKey, randomQuorumKey, toQuorumStruct } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import { connectAccount, connectQuorum } from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import { ProposalsService } from '../proposals/proposals.service';
import {
  CreateQuorumArgs,
  QuorumsArgs,
  RemoveQuorumArgs,
  UniqueQuorumArgs,
  UpdateQuorumArgs,
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
  async quorum(@Args() { account, key }: UniqueQuorumArgs): Promise<Quorum | null> {
    return this.prisma.quorum.findUnique({
      where: {
        accountId_key: {
          accountId: account,
          key,
        },
      },
    });
  }

  @Query(() => [Quorum])
  async quorums(@Args() args: QuorumsArgs, @DeviceAddr() device: Address): Promise<Quorum[]> {
    return this.prisma.quorum.findMany({
      ...args,
      where: {
        AND: [
          {
            states: {
              some: {
                approvers: {
                  some: { deviceId: device },
                },
              },
            },
          },
          args.where ?? {},
        ],
      },
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
  async create(
    @Args() args: CreateQuorumArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Create quorum
      const key = randomQuorumKey();
      await tx.quorum.create({
        data: {
          accountId: args.account,
          key,
          name: args.name,
        },
        select: null,
      });

      // Create quorum state
      return this.service.createUpsertState({
        ...args,
        proposer: device,
        key: randomQuorumKey(),
        tx,
        createArgs: getSelect(info),
      });
    });
  }

  @Mutation(() => Quorum)
  async update(
    @Args() args: UpdateQuorumArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.prisma.$transaction(async (tx) =>
      this.service.createUpsertState({
        ...args,
        proposer: device,
        proposingQuorumKey: args.proposingQuorumKey ?? args.key,
        tx,
        createArgs: getSelect(info),
      }),
    );
  }

  @Mutation(() => Quorum)
  async remove(
    @Args() { account, key, proposingQuorumKey = key }: RemoveQuorumArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const { id: proposalId } = await this.proposals.create(
        {
          account,
          data: {
            to: account,
            data: ACCOUNT_INTERFACE.encodeFunctionData('upsertQuorum', [
              key,
              toQuorumStruct({ key, approvers: new Set(), spending: {} }),
            ]),
            proposer: { connect: { id: device } },
            quorum: connectQuorum(account, proposingQuorumKey),
          },
          select: {
            id: true,
          },
        },
        tx,
      );

      tx.quorumState.create({
        data: {
          proposal: { connect: { id: proposalId } },
          account: connectAccount(account),
          quorum: connectQuorum(account, key),
          isRemoved: true,
        },
        select: {
          quorum: getSelect(info),
        },
      });
    });
  }

  @Mutation(() => Quorum)
  async setQuorumName() {
    // TODO: implement
  }
}
