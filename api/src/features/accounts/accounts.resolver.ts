import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { Account } from '@gen/account/account.model';
import {
  AccountArgs,
  SetAccountNameArgs,
  CreateAccountArgs,
  FindAccountsArgs,
} from './accounts.args';
import { getSelect } from '~/util/select';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { Address } from 'lib';
import { DeviceAddr } from '~/decorators/device.decorator';
import { UsersService } from '../users/users.service';
import { AccountsService } from './accounts.service';
import { Prisma } from '@prisma/client';
import { GqlAddress } from '~/apollo/scalars/Address.scalar';
import { User } from '@gen/user/user.model';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  @ResolveField(() => User)
  async deployUser(
    @Parent() account: Account,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    return this.prisma.user.findFirstOrThrow({
      where: {
        accountId: account.id,
        states: { some: { proposal: null } },
      },
      ...getSelect(info),
    });
  }

  @Query(() => Account)
  async account(
    @Args() { id }: AccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.findUniqueOrThrow({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Account])
  async accounts(
    @Args() args: FindAccountsArgs,
    @DeviceAddr() device: Address,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account[]> {
    return this.service.accounts(device, {
      ...args,
      ...getSelect(info),
    });
  }

  @Mutation(() => Account)
  async createAccount(
    @Args() { account, deploySalt, impl, name, users }: CreateAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.create({
      data: {
        id: account,
        deploySalt,
        impl,
        name,
        users: {
          create: users.map(
            (user): Prisma.UserCreateWithoutAccountInput => ({
              device: connectOrCreateDevice(user.device),
              name: user.name,
              states: this.usersService.getCreateUserState(user.configs),
            }),
          ),
        },
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
