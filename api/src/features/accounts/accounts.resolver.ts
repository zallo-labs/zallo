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
import { ProviderService } from '~/provider/provider.service';
import { calculateProxyAddress, randomDeploySalt } from 'lib';
import { CONFIG } from '~/config';

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
    private provider: ProviderService,
  ) {}

  @Query(() => Account)
  async account(
    @Args() { id: id }: AccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.findUniqueOrThrow({
      where: { id },
      ...getSelect(info),
    });
  }

  @Mutation(() => Account)
  async createAccount(
    @Args() { name, users }: CreateAccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    const impl = CONFIG.accountImplAddress;
    const deploySalt = randomDeploySalt();

    // TODO: accept multiple users on create
    const user = users[0];

    const addr = await calculateProxyAddress(
      {
        impl,
        user: {
          addr: user.device,
          configs: user.configs.map((c) => ({
            approvers: c.approvers,
            limits: Object.fromEntries(c.limits.map((l) => [l.token, l] as const)),
            spendingAllowlisted: c.spendingAllowlisted,
          })),
        },
      },
      this.provider.proxyFactory,
      deploySalt,
    );

    const r = await this.prisma.account.create({
      data: {
        id: addr,
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

    this.service.activateAccount(addr);

    return r;
  }

  @Mutation(() => Boolean)
  async activateAccount(@Args() { id: id }: AccountArgs): Promise<true> {
    await this.service.activateAccount(id);
    return true;
  }

  @Mutation(() => Account)
  async setAccountName(
    @Args() { id: id, name }: SetAccountNameArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { name },
      ...getSelect(info),
    });
  }
}
