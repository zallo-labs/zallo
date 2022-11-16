import { Args, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';
import { GraphQLResolveInfo } from 'graphql';
import { Account } from '@gen/account/account.model';
import { AccountArgs, SetAccountNameArgs, CreateAccountArgs } from './accounts.args';
import { makeGetSelect } from '~/util/select';
import { connectOrCreateDevice } from '~/util/connect-or-create';
import { UsersService } from '../users/users.service';
import { AccountsService } from './accounts.service';
import { Prisma } from '@prisma/client';
import { User } from '@gen/user/user.model';

const getSelect = makeGetSelect<{
  Account: Prisma.AccountSelect;
  User: Prisma.UserSelect;
}>({
  Account: {},
  User: {},
});

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private prisma: PrismaService,
    private users: UsersService,
  ) {}

  @ResolveField(() => User)
  async deployUser(@Parent() account: Account, @Info() info: GraphQLResolveInfo): Promise<User> {
    return this.prisma.user.findFirstOrThrow({
      where: {
        accountId: account.id,
        states: { some: { proposal: null } },
      },
      ...getSelect(info),
    });
  }

  @Query(() => Account)
  async account(@Args() { id }: AccountArgs, @Info() info: GraphQLResolveInfo): Promise<Account> {
    return this.prisma.account.findUniqueOrThrow({
      where: { id },
      ...getSelect(info),
    });
  }

  @Mutation(() => Account)
  async createAccount(
    @Args() { account, deploySalt, impl, name, users }: CreateAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    const r = await this.prisma.account.create({
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
              states: {
                create: {
                  configs: this.users.createUserConfigs(user.configs),
                  latestOfUserDeviceId: user.device,
                },
              },
            }),
          ),
        },
      },
      ...getSelect(info),
    });

    this.service.activateAccount(account);

    return r;
  }

  @Mutation(() => Boolean)
  async activateAccount(@Args() { id }: AccountArgs): Promise<true> {
    await this.service.activateAccount(id);
    return true;
  }

  @Mutation(() => Account)
  async setAccountName(
    @Args() { id, name }: SetAccountNameArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { name },
      ...getSelect(info),
    });
  }
}
