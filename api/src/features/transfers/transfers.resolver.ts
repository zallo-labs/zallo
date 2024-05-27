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
import { GqlContext } from '~/request/ctx';
import { asUser, getUserCtx } from '#/util/context';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { TransferSubscriptionPayload, getTransferTrigger } from './transfers.events';
import { ComputedField } from '~/decorators/computed.decorator';
import { DecimalScalar } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';

@Resolver(() => TransferDetails)
export class TransfersResolver {
  constructor(
    private service: TransfersService,
    private pubsub: PubsubService,
  ) {}

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
