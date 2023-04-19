import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Account } from '@gen/account/account.model';
import {
  AccountArgs,
  UpdateAccountInput,
  CreateAccountInput,
  AccountsArgs,
  AccountSubscriptionFilters,
  ACCOUNT_SUBSCRIPTION,
  USER_ACCOUNT_SUBSCRIPTION,
} from './accounts.args';
import { getSelect } from '~/util/select';
import { AccountSubscriptionPayload, AccountsService } from './accounts.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { asUser, getUser, userFromGraphqlContext } from '~/request/ctx';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(private service: AccountsService, private pubsub: PubsubService) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Args() { id }: AccountArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account | null> {
    return this.service.findUnique({
      where: { id },
      ...getSelect(info),
    });
  }

  @Query(() => [Account])
  async accounts(@Args() args: AccountsArgs, @Info() info: GraphQLResolveInfo): Promise<Account[]> {
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
      ctx,
      info: GraphQLResolveInfo,
    ) {
      return asUser(
        userFromGraphqlContext(ctx),
        async () =>
          await this.service.findUnique({ where: { id: account.id }, ...getSelect(info) }),
      );
    },
    filter: ({ event }: AccountSubscriptionPayload, { events }: AccountSubscriptionFilters) =>
      !events || events.includes(event),
  })
  async accountSubscription(@Args() { accounts }: AccountSubscriptionFilters) {
    return this.pubsub.asyncIterator(
      accounts
        ? [...accounts].map((id) => `${ACCOUNT_SUBSCRIPTION}.${id}`)
        : `${USER_ACCOUNT_SUBSCRIPTION}.${getUser()}`,
    );
  }

  @Mutation(() => Account)
  async createAccount(
    @Args('args') input: CreateAccountInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.service.createAccount(input, getSelect(info));
  }

  @Mutation(() => Account)
  async updateAccount(
    @Args('args') input: UpdateAccountInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Account> {
    return this.service.updateAccount(input, getSelect(info));
  }
}
