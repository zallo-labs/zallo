import { Args, Context, Info, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  AccountArgs,
  UpdateAccountInput,
  CreateAccountInput,
  AccountSubscriptionFilters,
  ACCOUNT_SUBSCRIPTION,
  USER_ACCOUNT_SUBSCRIPTION,
} from './accounts.args';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { GqlContext, asUser, getUser } from '~/request/ctx';
import { Account } from './accounts.model';
import { AccountSubscriptionPayload, AccountsService } from './accounts.service';
import { getShape } from '../database/database.select';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(private service: AccountsService, private pubsub: PubsubService) {}

  @Query(() => Account, { nullable: true })
  async account(@Args() { address }: AccountArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Query(() => [Account])
  async accounts(@Info() info: GraphQLResolveInfo) {
    return this.service.select(getShape(info));
  }

  @Subscription(() => Account, {
    name: ACCOUNT_SUBSCRIPTION,
    resolve(
      this: AccountsResolver,
      { account }: AccountSubscriptionPayload,
      _args,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, async () => this.service.selectUnique(account, getShape(info)));
    },
    filter: ({ event }: AccountSubscriptionPayload, { events }: AccountSubscriptionFilters) =>
      !events || events.includes(event),
  })
  async accountSubscription(
    @Args() { accounts }: AccountSubscriptionFilters,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, () =>
      this.pubsub.asyncIterator(
        accounts
          ? [...accounts].map((id) => `${ACCOUNT_SUBSCRIPTION}.${id}`)
          : `${USER_ACCOUNT_SUBSCRIPTION}.${getUser()}`,
      ),
    );
  }

  @Mutation(() => Account)
  async createAccount(@Args('args') input: CreateAccountInput, @Info() info: GraphQLResolveInfo) {
    const { address } = await this.service.createAccount(input);
    return this.service.selectUnique(address, getShape(info));
  }

  @Mutation(() => Account)
  async updateAccount(@Args('args') input: UpdateAccountInput, @Info() info: GraphQLResolveInfo) {
    await this.service.updateAccount(input);
    return this.service.selectUnique(input.address, getShape(info));
  }
}
