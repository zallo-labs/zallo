import { Args, Context, Info, Parent, Query, Resolver, Subscription } from '@nestjs/graphql';
import {
  TRANSFER_VALUE_FIELDS_SHAPE,
  TransferValueSelectFields,
  TransfersService,
} from './transfers.service';
import { TransferSubscriptionInput } from './transfers.input';
import { Transfer, Transferlike } from './transfers.model';
import { GraphQLResolveInfo } from 'graphql';
import { getShape } from '~/core/database';
import { Input, InputArgs } from '~/common/decorators/input.decorator';
import { GqlContext } from '~/core/apollo/ctx';
import { asUser, getUserCtx } from '~/core/context';
import { PubsubService } from '~/core/pubsub/pubsub.service';
import { TransferSubscriptionPayload, transferTrigger } from './transfers.events';
import { ComputedField } from '~/common/decorators/computed.decorator';
import { DecimalScalar } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { NodeArgs } from '../nodes/nodes.input';

@Resolver(() => Transferlike)
export class TransfersResolver {
  constructor(
    private service: TransfersService,
    private pubsub: PubsubService,
  ) {}

  @Query(() => Transferlike, { nullable: true })
  async transfer(@Args() { id }: NodeArgs, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(id, getShape(info));
  }

  @ComputedField(() => DecimalScalar, TRANSFER_VALUE_FIELDS_SHAPE, { nullable: true })
  async value(@Parent() parent: TransferValueSelectFields): Promise<Decimal | null> {
    return this.service.value(parent);
  }

  @Subscription(() => Transfer, {
    name: 'transfer',
    filter: (
      transfer: TransferSubscriptionPayload,
      { input }: InputArgs<TransferSubscriptionInput>,
    ) => {
      return (
        (input.incoming === undefined || transfer.incoming === input.incoming) &&
        (input.outgoing === undefined || transfer.outgoing === input.outgoing) &&
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

      return this.pubsub.asyncIterator(accounts.map((account) => transferTrigger(account)));
    });
  }
}
