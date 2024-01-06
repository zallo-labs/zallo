import { Context, Info, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { GraphQLResolveInfo } from 'graphql';

import { DecimalScalar } from '~/apollo/scalars/Decimal.scalar';
import { ComputedField } from '~/decorators/computed.decorator';
import { Input, InputArgs } from '~/decorators/input.decorator';
import { asUser, getUserCtx, GqlContext } from '~/request/ctx';
import { getShape } from '../database/database.select';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { getTransferTrigger, TransferSubscriptionPayload } from './transfers.events';
import { TransfersInput, TransferSubscriptionInput } from './transfers.input';
import { Transfer, TransferDetails } from './transfers.model';
import {
  TRANSFER_VALUE_FIELDS_SHAPE,
  TransfersService,
  TransferValueSelectFields,
} from './transfers.service';

@Resolver(() => TransferDetails)
export class TransfersResolver {
  constructor(
    private service: TransfersService,
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
      transfer: TransferSubscriptionPayload,
      { input }: InputArgs<TransferSubscriptionInput>,
    ) => {
      return (
        (input.direction === undefined || transfer.directions.includes(input.direction)) &&
        (input.internal === undefined || input.internal === transfer.internal)
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

  @ComputedField(() => DecimalScalar, TRANSFER_VALUE_FIELDS_SHAPE, { nullable: true })
  async value(@Parent() parent: TransferValueSelectFields): Promise<Decimal | null> {
    return this.service.value(parent);
  }
}
