import { Context, Info, Query, Resolver, Subscription } from '@nestjs/graphql';
import { TransfersService } from './transfers.service';
import { TransferSubscriptionInput, TransfersInput } from './transfers.input';
import { Transfer } from './transfers.model';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { Input, InputArgs } from '~/decorators/input.decorator';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { TransferSubscriptionPayload, getTransferTrigger } from './transfers.events';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Address } from 'lib';

@Resolver(() => Transfer)
export class TransfersResolver {
  constructor(
    private service: TransfersService,
    private db: DatabaseService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => [Transfer])
  async transfers(
    @Input({ defaultValue: {} }) input: TransfersInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @Subscription(() => Transfer, {
    name: 'transfer',
    filter: (
      { direction }: TransferSubscriptionPayload,
      { input: { directions } }: InputArgs<TransferSubscriptionInput>,
    ) => {
      return !directions || directions.includes(direction);
    },
    resolve(
      this: TransfersResolver,
      { transfer }: TransferSubscriptionPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, () => this.service.selectUnique(transfer, getShape(info)));
    },
  })
  async subscribeToTransfers(
    @Input({ defaultValue: {} }) { accounts }: TransferSubscriptionInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, async () => {
      // Subscribe to all available accounts if none are specified
      accounts ??= (await this.db.query(
        e.select(e.Account, (account) => ({
          filter: e.op(account.id, 'in', e.cast(e.uuid, e.set(...getUserCtx().accounts))),
          address: true,
        })).address,
      )) as Address[];

      return this.pubsub.asyncIterator(accounts.map((account) => getTransferTrigger(account)));
    });
  }
}
