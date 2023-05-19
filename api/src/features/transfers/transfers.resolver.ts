import { Context, Info, Query, Resolver, Subscription } from '@nestjs/graphql';
import { TransfersService } from './transfers.service';
import { TransferSubscriptionInput, TransfersInput } from './transfers.input';
import { Transfer } from './transfers.model';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { Input, InputArgs } from '~/decorators/input.decorator';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { PubsubService } from '../util/pubsub/pubsub.service';
import {
  TRANSFER_SUBSCRIPTION,
  TransferSubscriptionPayload,
  ACCOUNT_TRANSFER_SUBSCRIPTION,
} from './transfers.events';

@Resolver(() => Transfer)
export class TransfersResolver {
  constructor(private service: TransfersService, private pubsub: PubsubService) {}

  @Query(() => [Transfer])
  async transfers(
    @Input({ defaultValue: {} }) input: TransfersInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.select(input, getShape(info));
  }

  @Subscription(() => Transfer, {
    name: TRANSFER_SUBSCRIPTION,
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
    return asUser(ctx, () => {
      return this.pubsub.asyncIterator(
        (accounts ?? getUserCtx().accounts).map(
          (account) => `${ACCOUNT_TRANSFER_SUBSCRIPTION}.${account}`,
        ),
      );
    });
  }
}
