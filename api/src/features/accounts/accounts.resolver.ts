import { Context, Info, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  AccountInput,
  UpdateAccountInput,
  CreateAccountInput,
  AccountSubscriptionInput,
} from './accounts.input';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { GqlContext, asUser, getUser } from '~/request/ctx';
import { Account } from './accounts.model';
import {
  AccountSubscriptionPayload,
  AccountsService,
  getAccountTrigger,
  getAccountUserTrigger,
} from './accounts.service';
import { getShape } from '../database/database.select';
import { Input, InputArgs } from '~/decorators/input.decorator';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(private service: AccountsService, private pubsub: PubsubService) {}

  @Query(() => Account, { nullable: true })
  async account(@Input() { address }: AccountInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(address, getShape(info));
  }

  @Query(() => [Account])
  async accounts(@Info() info: GraphQLResolveInfo) {
    return this.service.select({}, getShape(info));
  }

  @Subscription(() => Account, {
    name: 'account',
    filter: (
      { event }: AccountSubscriptionPayload,
      { input: { events } }: InputArgs<AccountSubscriptionInput>,
    ) => !events || events.includes(event),
    resolve(
      this: AccountsResolver,
      { account }: AccountSubscriptionPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, async () => this.service.selectUnique(account, getShape(info)));
    },
  })
  async subscribeToAccounts(
    @Input({ defaultValue: {} }) { accounts }: AccountSubscriptionInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, () =>
      this.pubsub.asyncIterator(
        accounts ? [...accounts].map(getAccountTrigger) : getAccountUserTrigger(getUser()),
      ),
    );
  }

  @Mutation(() => Account)
  async createAccount(@Input() input: CreateAccountInput, @Info() info: GraphQLResolveInfo) {
    const { address } = await this.service.createAccount(input);
    return this.service.selectUnique(address, getShape(info));
  }

  @Mutation(() => Account)
  async updateAccount(@Input() input: UpdateAccountInput, @Info() info: GraphQLResolveInfo) {
    await this.service.updateAccount(input);
    return this.service.selectUnique(input.address, getShape(info));
  }
}
