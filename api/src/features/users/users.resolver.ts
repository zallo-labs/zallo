import { UserState } from '@gen/user-state/user-state.model';
import { User } from '@gen/user/user.model';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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
    return this.service.latestState(user, true, getSelect(info));
  }

  @ResolveField(() => UserState, { nullable: true })
  async proposedState(
    @Parent() user: User,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UserState | null> {
    return this.service.latestState(user, false, getSelect(info));
  }

  @Query(() => User)
  async user(
    @Args() { id }: FindUniqueUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
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
      where: { deviceId: device },
      ...getSelect(info),
    });
  }

  @Mutation(() => User)
  async upsertUser(
    @Args() { user, proposalHash }: UpsertUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        accountId_deviceId: {
          accountId: user.id.account,
          deviceId: user.id.device,
        },
      },
      create: {
        account: { connect: { id: user.id.account } },
        device: connectOrCreateDevice(user.id.device),
        states: this.service.getCreateUserState(user.configs, proposalHash),
        name: user.name,
      },
      update: {
        states: this.service.getCreateUserState(user.configs, proposalHash),
        name: { set: user.name },
      },
      ...getSelect(info),
    });
  }

  @Mutation(() => User)
  async removeUser(
    @Args() { id, proposalHash }: RemoveUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    const isActive = await this.service.isActive(id);

    if (isActive) {
      if (!proposalHash)
        throw new UserInputError(
          'Proposal is required to remove an active user',
        );

      return this.prisma.user.update({
        where: {
          accountId_deviceId: {
            accountId: id.account,
            deviceId: id.device,
          },
        },
        data: {
          states: {
            create: {
              proposalHash,
              isDeleted: true,
            },
          },
        },
        ...getSelect(info),
      });
    } else {
      return this.prisma.user.delete({
        where: {
          accountId_deviceId: {
            accountId: id.account,
            deviceId: id.device,
          },
        },
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
      where: {
        accountId_deviceId: {
          accountId: id.account,
          deviceId: id.device,
        },
      },
      data: {
        name: { set: name },
      },
      ...getSelect(info),
    });
  }
}
