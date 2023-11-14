import { Context, Info, Mutation, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  AccountInput,
  UpdateAccountInput,
  CreateAccountInput,
  AccountSubscriptionInput,
  LabelAvailableInput,
} from './accounts.input';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { GqlContext, asUser, getApprover, getUserCtx } from '~/request/ctx';
import { Account } from './accounts.model';
import {
  AccountSubscriptionPayload,
  AccountsService,
  getAccountTrigger,
  getAccountApproverTrigger,
} from './accounts.service';
import { getShape } from '../database/database.select';
import { Input, InputArgs } from '~/decorators/input.decorator';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';
import { CONFIG } from '~/config';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private pubsub: PubsubService,
    private accountsCache: AccountsCacheService,
  ) {}

  @ComputedField<typeof e.Account>(() => String, { label: true })
  name(@Parent() { label }: Account): string {
    return label + CONFIG.ensSuffix;
  }

  @Query(() => Account, { nullable: true })
  async account(
    @Input({ defaultValue: {} }) { address }: AccountInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const r = await this.service.selectUnique(address, getShape(info));
    return r;
  }

  @Query(() => [Account])
  async accounts(@Info() info: GraphQLResolveInfo) {
    return this.service.select({}, getShape(info));
  }

  @Query(() => Boolean)
  async labelAvailable(@Input() { label }: LabelAvailableInput) {
    return this.service.labelAvailable(label);
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
      return asUser(ctx, async () => {
        // Context will not include newly created account (yet), as it was created on subscription
        getUserCtx().accounts = await this.accountsCache.getApproverAccounts(getApprover());

        return await this.service.selectUnique(account, getShape(info));
      });
    },
  })
  async subscribeToAccounts(
    @Input({ defaultValue: {} }) { accounts }: AccountSubscriptionInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, () =>
      this.pubsub.asyncIterator(
        accounts ? [...accounts].map(getAccountTrigger) : getAccountApproverTrigger(getApprover()),
      ),
    );
  }
}
