import { Args, Info, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PrismaService } from '../util/prisma/prisma.service';
import { GraphQLResolveInfo } from 'graphql';
import { Account } from '@gen/account/account.model';
import {
  AccountArgs,
  UpdateAccountMetadataArgs,
  CreateAccountArgs,
  AccountsArgs,
  AccountSubscriptionFilters,
  AccountSubscriptionPayload,
  ACCOUNT_SUBSCRIPTION,
  AccountEvent,
  USER_ACCOUNT_SUBSCRIPTION,
} from './accounts.args';
import { makeGetSelect } from '~/util/select';
import { AccountsService } from './accounts.service';
import { Prisma } from '@prisma/client';
import { ProviderService } from '~/features/util/provider/provider.service';
import { address, calculateProxyAddress, Quorum, randomDeploySalt, toQuorumKey } from 'lib';
import { CONFIG } from '~/config';
import { UserCtx } from '~/decorators/user.decorator';
import { QuorumInput } from '../quorums/quorums.args';
import { FaucetService } from '../faucet/faucet.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { UserContext, Context, getRequestContext } from '~/request/ctx';
import { RequestContext } from 'nestjs-request-context';
import { connectOrCreateUser } from '~/util/connect-or-create';

const getSelect = makeGetSelect<{
  Account: Prisma.AccountSelect;
}>({
  Account: {},
});

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private prisma: PrismaService,
    private provider: ProviderService,
    private faucet: FaucetService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Args() { id }: AccountArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.prisma.asUser.account.findUnique({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Account])
  async accounts(
    @Args() args: AccountsArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account[]> {
    const accounts = await this.prisma.asUser.account.findMany({
      ...args,
      ...getSelect(info),
    });

    return accounts;
  }

  @Subscription(() => Account, {
    name: ACCOUNT_SUBSCRIPTION,
    filter: ({ event }: AccountSubscriptionPayload, { events }: AccountSubscriptionFilters) =>
      !events || events.has(event),
  })
  async accountSubscription(
    @UserCtx() user: UserContext,
    @Args() { accounts }: AccountSubscriptionFilters,
  ) {
    return this.pubsub.asyncIterator(
      accounts
        ? [...accounts].map((id) => `${ACCOUNT_SUBSCRIPTION}.${id}`)
        : `${USER_ACCOUNT_SUBSCRIPTION}.${user.id}`,
    );
  }

  @Mutation(() => Account)
  async createAccount(
    @Args() { name, quorums: quorumsArg }: CreateAccountArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account> {
    const impl = address(CONFIG.accountImplAddress);
    const deploySalt = randomDeploySalt();

    // Start key from 1 as apollo interprets key=0 as key=NaN for some reason?
    const quorums: Quorum[] = quorumsArg.map((q, i) => QuorumInput.toQuorum(q, toQuorumKey(i + 1)));

    const addr = await this.provider.useProxyFactory((factory) =>
      calculateProxyAddress({ impl, quorums }, factory, deploySalt),
    );

    // Add account to user context
    const req = getRequestContext();
    req?.user?.accounts.add(addr);

    await this.prisma.asUser.account.create({
      data: {
        id: addr,
        deploySalt,
        impl,
        name,
        quorums: {
          create: quorums.map((q, i) => ({
            name: quorumsArg[i].name,
            key: q.key,
            states: {
              create: {
                approvers: {
                  create: [...q.approvers].map((a) => ({ user: connectOrCreateUser(a) })),
                },
                spendingFallback: q.spending?.fallback,
                limits: q.spending?.limits
                  ? {
                      createMany: {
                        data: Object.values(q.spending.limits).map((limit) => ({
                          token: limit.token,
                          amount: limit.amount.toString(),
                          period: limit.period,
                        })),
                      },
                    }
                  : undefined,
              },
            },
          })),
        },
      },
      select: null,
    });

    req.session?.accounts?.add(addr);

    const r = await this.service.activateAccount(addr, { ...getSelect(info) });

    this.service.publishAccount({ account: r, event: AccountEvent.create });
    this.faucet.requestTokens(addr);

    return r;
  }

  @Mutation(() => Account)
  async updateAccountMetadata(
    @Args() { id, name }: UpdateAccountMetadataArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account> {
    const r = await this.prisma.asUser.account.update({
      where: { id },
      data: { name },
      ...getSelect(info),
    });

    this.service.publishAccount({ account: r, event: AccountEvent.update });

    return r;
  }
}
