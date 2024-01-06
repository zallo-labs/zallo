import { createUnionType, Field, InterfaceType } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';
import { match } from 'ts-pattern';

import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eDefault from '~/edgeql-js/modules/default';
import { Account } from '../accounts/accounts.model';
import { Transfer, TransferApproval } from '../transfers/transfers.model';

@InterfaceType()
export class EventBase {
  @IdField()
  id: uuid;

  @Field(() => Account)
  account: Account;

  @Field(() => Number)
  logIndex: number;

  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => Date)
  timestamp: Date;
}

export type Event = typeof Event;

export const Event = createUnionType({
  name: 'Event',
  types: () => [Transfer, TransferApproval] as const,
  resolveType: (v) =>
    match(v.__type__?.name)
      .with('default::Transfer' satisfies (typeof eDefault.$Transfer)['__name__'], () => Transfer)
      .with(
        'default::TransferApproval' satisfies (typeof eDefault.$TransferApproval)['__name__'],
        () => TransferApproval,
      )
      .otherwise(() => {
        throw new Error('Unhandled event type: ' + JSON.stringify(v));
      }),
});
