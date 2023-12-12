import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';
import { Event } from '../events/events.model';
import { Transfer, TransferApproval } from '../transfers/transfers.model';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';

@ObjectType()
export class Receipt {
  @IdField()
  id: uuid;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => [BytesScalar])
  responses: string[]; // Hex

  @Field(() => [Event])
  events: Event[];

  @Field(() => [Transfer])
  transferEvents: Transfer[];

  @Field(() => [TransferApproval])
  transferApprovalEvents: TransferApproval[];

  @Field(() => GraphQLBigInt)
  gasUsed: bigint;

  @DecimalField()
  ethFee: Decimal;

  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => Date)
  timestamp: Date;
}
