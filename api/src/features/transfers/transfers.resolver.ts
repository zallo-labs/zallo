import { Context, Info, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import {
  TRANSFER_VALUE_FIELDS_SHAPE,
  TransferValueSelectFields,
  TransfersService,
} from './transfers.service';
import { TransferSubscriptionInput, TransfersInput } from './transfers.input';
import { Transfer, TransferDetails } from './transfers.model';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '../database/database.select';
import { Input, InputArgs } from '~/decorators/input.decorator';
import { GqlContext, asUser, getUserCtx } from '~/request/ctx';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { TransferSubscriptionPayload, getTransferTrigger } from './transfers.events';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Address } from 'lib';
import { ComputedField } from '~/decorators/computed.decorator';
import { GraphQLBigInt } from 'graphql-scalars';

@Resolver(() => TransferDetails)
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
      { direction, isExternal }: TransferSubscriptionPayload,
      { input: { directions, external } }: InputArgs<TransferSubscriptionInput>,
    ) => {
      return (
        (!directions || directions.includes(direction)) &&
        (external === undefined || external === isExternal)
      );
    },
    resolve(
      this: TransfersResolver,
      { transfer }: TransferSubscriptionPayload,
      _input,
      ctx: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      return asUser(ctx, async () => await this.service.selectUnique(transfer, getShape(info)));
    },
  })
  async subscribeToTransfers(
    @Input({ defaultValue: {} }) { accounts }: TransferSubscriptionInput,
    @Context() ctx: GqlContext,
  ) {
    return asUser(ctx, async () => {
      // Subscribe to all available accounts if none are specified
      if (!accounts?.length) accounts = getUserCtx().accounts.map((a) => a.address);

      return this.pubsub.asyncIterator(accounts.map((account) => getTransferTrigger(account)));
    });
  }

  @ComputedField(() => GraphQLBigInt, TRANSFER_VALUE_FIELDS_SHAPE)
  async value(@Parent() parent: TransferValueSelectFields): Promise<bigint> {
    return this.service.value(parent);
  }
}
