import { Args, Info, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PrismaService } from '../util/prisma/prisma.service';
import { GraphQLResolveInfo } from 'graphql';
import { Account } from '@gen/account/account.model';
import {
  AccountArgs,
  UpdateAccountArgs,
  CreateAccountArgs,
  AccountsArgs,
  AccountSubscriptionFilters,
  AccountSubscriptionPayload,
  ACCOUNT_SUBSCRIPTION,
  AccountEvent,
  USER_ACCOUNT_SUBSCRIPTION,
} from './accounts.args';
import { getSelect } from '~/util/select';
import { AccountsService } from './accounts.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { asPolicyKey, calculateProxyAddress, randomDeploySalt } from 'lib';
import { CONFIG } from '~/config';
import { UserId } from '~/decorators/user.decorator';
import { FaucetService } from '../faucet/faucet.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { UserContext, getRequestContext, getUser } from '~/request/ctx';
import { Prisma } from '@prisma/client';
import { inputAsPolicy, policyAsCreateState } from '../policies/policies.util';
import { ContractsService } from '../contracts/contracts.service';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private prisma: PrismaService,
    private provider: ProviderService,
    private contracts: ContractsService,
    private faucet: FaucetService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Args() { id }: AccountArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.service.findUnique({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Account])
  async accounts(
    @Args() args: AccountsArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account[]> {
    return this.service.findMany({
      ...args,
      ...getSelect(info),
    });
  }

  @Subscription(() => Account, {
    name: ACCOUNT_SUBSCRIPTION,
    resolve(
      this: AccountsResolver,
      { account }: AccountSubscriptionPayload,
      _args,
      _context,
      info: GraphQLResolveInfo,
    ) {
      return this.service.findUnique({
        where: { id: account.id },
        ...getSelect(info),
      });
    },
    filter: ({ event }: AccountSubscriptionPayload, { events }: AccountSubscriptionFilters) =>
      !events || events.includes(event),
  })
  async accountSubscription(
    @UserId() user: UserContext,
    @Args() { accounts }: AccountSubscriptionFilters,
  ) {
    return this.pubsub.asyncIterator(
      accounts
        ? [...accounts].map((id) => `${ACCOUNT_SUBSCRIPTION}.${id}`)
        : `${USER_ACCOUNT_SUBSCRIPTION}.${user}`,
    );
  }

  @Mutation(() => Account)
  async createAccount(
    @Args() { name, policies: policyInputs }: CreateAccountArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account> {
    const impl = CONFIG.accountImplAddress;
    const deploySalt = randomDeploySalt();

    const policies = policyInputs.map((p, i) => ({
      ...inputAsPolicy(asPolicyKey(i), p),
      name: p.name || `Policy ${i}`,
    }));

    const account = await this.provider.useProxyFactory((factory) =>
      calculateProxyAddress({ impl, policies }, factory, deploySalt),
    );

    // Add account to user context
    getUser().accounts.add(account);
    getRequestContext()?.session?.accounts?.push(account);

    await this.prisma.asUser.$transaction(async (prisma) => {
      const { policyStates } = await prisma.account.create({
        data: {
          id: account,
          deploySalt,
          impl,
          name,
          policies: {
            create: policies.map(
              (policy): Prisma.PolicyCreateWithoutAccountInput => ({
                key: policy.key,
                name: policy.name,
                states: {
                  create: {
                    ...policyAsCreateState(policy),
                  },
                },
              }),
            ),
          },
        },
        select: {
          policyStates: {
            select: {
              id: true,
              policyKey: true,
            },
          },
        },
      });

      // Set policy rules as draft of policies - this can't be done in the same create as the account )':
      await Promise.all(
        policyStates.map(({ id, policyKey }) =>
          prisma.policy.update({
            where: { accountId_key: { accountId: account, key: policyKey } },
            data: { draftId: id },
            select: null,
          }),
        ),
      );
    });

    const r = await this.service.activateAccount(account, { ...getSelect(info) });

    this.service.publishAccount({ account: { id: account }, event: AccountEvent.create });
    await this.contracts.addAccountAsVerified(account);
    this.faucet.requestTokens(account);

    return r;
  }

  @Mutation(() => Account)
  async updateAccount(
    @Args() { id, name }: UpdateAccountArgs,
    @Info() info?: GraphQLResolveInfo,
  ): Promise<Account> {
    const r = await this.prisma.asUser.account.update({
      where: { id },
      data: { name },
      ...getSelect(info),
    });

    this.service.publishAccount({ account: { id }, event: AccountEvent.update });

    return r;
  }
}
