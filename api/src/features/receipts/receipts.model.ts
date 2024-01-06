import { Field, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';

import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { Event } from '../events/events.model';
import { Transfer, TransferApproval } from '../transfers/transfers.model';

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
  ethFeePerGas: Decimal;

  @DecimalField()
  networkEthFee: Decimal;

  @DecimalField()
  ethFees: Decimal;

  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => Date)
  timestamp: Date;
}
