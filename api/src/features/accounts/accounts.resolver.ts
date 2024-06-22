import { Context, Info, Mutation, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  AccountInput,
  UpdateAccountInput,
  CreateAccountInput,
  AccountSubscriptionInput,
  NameAvailableInput,
  AccountsInput,
} from './accounts.input';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { GqlContext } from '~/request/ctx';
import { asUser, getApprover, getUserCtx } from '#/util/context';
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
import { Transfer } from '../transfers/transfers.model';
import { TransfersInput } from '../transfers/transfers.input';
import { TransfersService } from '../transfers/transfers.service';
import { ProposalsInput } from '#/proposals/proposals.input';
import { ProposalsService } from '#/proposals/proposals.service';
import { Proposal } from '#/proposals/proposals.model';

@Resolver(() => Account)
export class AccountsResolver {
  constructor(
    private service: AccountsService,
    private pubsub: PubsubService,
    private accountsCache: AccountsCacheService,
    private transfersService: TransfersService,
    private proposalsService: ProposalsService,
  ) {}

  @Query(() => Account, { nullable: true })
  async account(
    @Input({ defaultValue: {} }) { account }: AccountInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.selectUnique(account, getShape(info));
  }

  @Query(() => [Account])
  async accounts(
    @Input({ defaultValue: {} }) input: AccountsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @Query(() => Boolean)
  async nameAvailable(@Input() { name }: NameAvailableInput) {
    return this.service.nameAvailable(name);
  }

  @Mutation(() => Account)
  async createAccount(@Input() input: CreateAccountInput, @Info() info: GraphQLResolveInfo) {
    const { address } = await this.service.createAccount(input);
    return this.service.selectUnique(address, getShape(info));
  }

  @Mutation(() => Account)
  async updateAccount(@Input() input: UpdateAccountInput, @Info() info: GraphQLResolveInfo) {
    await this.service.updateAccount(input);
    return this.service.selectUnique(input.account, getShape(info));
  }

  @ComputedField<typeof e.Account>(() => [Transfer], { id: true })
  transfers(
    @Parent() { id }: Account,
    @Input({ defaultValue: {} }) input: TransfersInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.transfersService.select(id, input, getShape(info));
  }

  @ComputedField<typeof e.Account>(() => [Proposal], { id: true })
  proposals(
    @Parent() { id }: Account,
    @Input({ defaultValue: {} }) input: ProposalsInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.proposalsService.select(id, input, getShape(info));
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
