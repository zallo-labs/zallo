import { Field, InterfaceType, createUnionType } from '@nestjs/graphql';
import { BytesField, BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { GraphQLBigInt } from 'graphql-scalars';
import { Event } from '../events/events.model';
import { Transfer, TransferApproval } from '../transfers/transfers.model';
import { DecimalScalar } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { Node, NodeInterface, NodeType } from '~/decorators/interface.decorator';
import { Hex } from 'lib';
import { makeUnionTypeResolver } from '../database/database.util';
import e from '~/edgeql-js';

@NodeInterface()
export class Result extends Node {
  @Field(() => Date)
  timestamp: Date;

  @Field(() => [Event])
  events: Event[];

  @Field(() => [Transfer])
  transfers: Transfer[];

  @Field(() => [TransferApproval])
  transferApprovals: TransferApproval[];
}

@InterfaceType({ implements: [Result] })
export class ReceiptResult extends Result {
  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => GraphQLBigInt)
  gasUsed: bigint;

  @Field(() => DecimalScalar)
  ethFeePerGas: Decimal;
}

@NodeType({ implements: [Result, ReceiptResult] })
export class Successful extends ReceiptResult {
  @Field(() => [BytesScalar])
  responses: Hex[];
}

@NodeType({ implements: [Result, ReceiptResult] })
export class Failed extends ReceiptResult {
  @BytesField()
  reason: Hex;
}

@NodeType({ implements: [Result] })
export class Scheduled extends Result {
  @Field(() => Date)
  scheduledFor: Date;

  @Field(() => Boolean)
  cancelled: boolean;
}

// export type Result = typeof Result;
// export const Result = createUnionType({
//   name: 'Result',
//   types: () => [Successful, Failed, Scheduled] as const,
//   resolveType: makeUnionTypeResolver([
//     [e.Successful, Successful],
//     [e.Failed, Failed],
//     [e.Scheduled, Scheduled],
//   ]),
// });
