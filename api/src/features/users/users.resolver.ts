import { UserState } from '@gen/user-state/user-state.model';
import { User } from '@gen/user/user.model';
import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { UserInputError } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import { address, Address, getUserIdStr, Id } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { makeGetSelect } from '~/util/select';
import {
  FindUsersArgs,
  FindUniqueUserArgs,
  UpsertUserArgs,
  RemoveUserArgs,
  SetUserNameArgs,
  UserIdInput,
} from './users.args';
import { UsersService } from './users.service';

const getSelect = makeGetSelect<{
  User: Prisma.UserSelect;
}>({
  User: {
    accountId: true,
    deviceId: true,
  },
});

const getUserWhere = (id: UserIdInput): Prisma.UserFindUniqueArgs['where'] => ({
  accountId_deviceId: {
    accountId: id.account,
    deviceId: id.device,
  },
});

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService, private prisma: PrismaService) {}

  @ResolveField(() => String)
  id(@Parent() user: User): Id {
    return getUserIdStr(user.accountId, address(user.deviceId));
  }

  @ResolveField(() => UserState, { nullable: true })
  async activeState(
    @Parent() user: User,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UserState | null> {
    return this.service.latestState(
      { account: address(user.accountId), addr: address(user.deviceId) },
      true,
      getSelect(info),
    );
  }

  @ResolveField(() => UserState, { nullable: true })
  async proposedState(
    @Parent() user: User,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UserState | null> {
    return this.service.latestState(
      { account: address(user.accountId), addr: address(user.deviceId) },
      false,
      getSelect(info),
    );
  }

  @Query(() => User)
  async user(@Args() { id }: FindUniqueUserArgs, @Info() info: GraphQLResolveInfo): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        accountId_deviceId: {
          accountId: id.account,
          deviceId: id.device,
        },
      },
      ...getSelect(info),
    });
  }

  @Query(() => [User])
  async users(
    @Args() args: FindUsersArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User[]> {
    return this.prisma.user.findMany({
      ...args,
      where: {
        deviceId: device,
        latestState: {
          isDeleted: false,
        },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => User)
  async upsertUser(
    @Args() { user, proposalId }: UpsertUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    const userId = getUserWhere(user.id);

    return this.prisma.$transaction(async (tx) => {
      const { latestState } = await tx.user.upsert({
        where: userId,
        create: {
          account: { connect: { id: user.id.account } },
          device: connectOrCreateDevice(user.id.device),
          name: user.name,
        },
        update: {
          name: user.name,
        },
        select: {
          latestState: {
            select: {
              id: true,
            },
          },
        },
      });

      // Remove latest state; connect tries to nullify accountId as well so this must be done manually
      if (latestState) {
        await tx.userState.update({
          where: {
            accountId_latestOfUserDeviceId: {
              accountId: user.id.account,
              latestOfUserDeviceId: user.id.device,
            },
          },
          data: {
            latestOfUserDeviceId: null,
          },
        });
      }

      // The account or user can't be their own approver
      const configs = user.configs.map((config) => {
        config.approvers.delete(user.id.account);
        return config;
      });

      const r = await tx.userState.create({
        data: {
          account: { connect: { id: user.id.account } },
          user: { connect: userId },
          proposal: { connect: { id: proposalId } },
          latestOfUser: { connect: userId },
          configs: this.service.createUserConfigs(configs),
        },
        select: {
          user: {
            ...getSelect(info),
          },
        },
      });

      return r.user as User;
    });
  }

  @Mutation(() => User)
  async removeUser(
    @Args() { id, proposalId }: RemoveUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    const isActive = await this.service.isActive({
      account: id.account,
      addr: id.device,
    });

    const userWhere = getUserWhere(id);

    if (isActive) {
      if (!proposalId) throw new UserInputError('Proposal is required to remove an active user');

      return this.prisma.user.update({
        where: userWhere,
        data: {
          states: {
            create: {
              isDeleted: true,
              account: { connect: { id: id.account } },
              proposal: { connect: { id: proposalId } },
              latestOfUser: { connect: userWhere },
            },
          },
        },
        ...getSelect(info),
      });
    } else {
      return this.prisma.user.delete({
        where: userWhere,
        ...getSelect(info),
      });
    }
  }

  @Mutation(() => User)
  async setUserName(
    @Args() { id, name }: SetUserNameArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.update({
      where: getUserWhere(id),
      data: { name },
      ...getSelect(info),
    });
  }
}
