import { Field, createUnionType } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';
import { Account } from '../accounts/accounts.model';
import { Transfer, TransferApproval } from '../transfers/transfers.model';

@ObjectType()
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
});
