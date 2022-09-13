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
import { GraphQLResolveInfo } from 'graphql';
import { address, Address, getUserIdStr, Id } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { DeviceAddr } from '~/decorators/device.decorator';
import {
  connectOrCreateAccount,
  connectOrCreateDevice,
} from '~/util/connect-or-create';
import { getSelect } from '~/util/select';
import {
  FindUsersArgs,
  FindUniqueUserArgs,
  UpsertUserArgs,
  RemoveUserArgs,
  SetUserNameArgs,
} from './users.args';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private service: UsersService, private prisma: PrismaService) {}

  @ResolveField(() => String)
  id(@Parent() user: User): Id {
    return getUserIdStr(user.accountId, address(user.deviceId));
  }

  @ResolveField(() => UserState)
  async activeState(@Parent() user: User) {
    return this.service.latestState(user, true);
  }

  @ResolveField(() => UserState)
  async proposedState(@Parent() user: User) {
    return this.service.latestState(user, false);
  }

  @Query(() => User)
  async user(
    @Args() { account, device }: FindUniqueUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        accountId_deviceId: {
          accountId: account,
          deviceId: device,
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
          accountId: user.account,
          deviceId: user.device,
        },
      },
      create: {
        account: connectOrCreateAccount(user.account),
        device: connectOrCreateDevice(user.device),
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
    @Args() { account, device, proposalHash }: RemoveUserArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        accountId_deviceId: {
          accountId: account,
          deviceId: device,
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
  }

  @Mutation(() => User)
  async setUserName(
    @Args() { account, device, name }: SetUserNameArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        accountId_deviceId: {
          accountId: account,
          deviceId: device,
        },
      },
      data: {
        name: { set: name },
      },
      ...getSelect(info),
    });
  }
}
