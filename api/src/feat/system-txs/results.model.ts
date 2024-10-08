import { Field, IntersectionType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Event } from '../events/events.model';
import { Transfer } from '../transfers/transfers.model';
import { DecimalField } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { Node, NodeInterface, NodeType } from '~/common/decorators/interface.decorator';
import { Hex } from 'lib';
import { BytesField } from '~/common/scalars';
import { Transaction } from '../transactions/transactions.model';
import { SystemTx } from './system-tx.model';

@NodeInterface()
export class Result extends Node {
  @Field(() => Transaction)
  transaction: Transaction;

  @Field(() => SystemTx, { nullable: true })
  systx?: SystemTx;

  @BytesField()
  response: Hex;

  @Field(() => GraphQLBigInt)
  gasUsed: bigint;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => [Event])
  events: Event[];

  @Field(() => [Transfer])
  transfers: Transfer[];
}

@NodeInterface({ implements: [Result] })
export class Success extends Result {}

@NodeInterface({ implements: [Result] })
export class Failure extends Result {
  @Field(() => String, { nullable: true })
  reason?: string;
}

@NodeType({ implements: [Result, Success] })
export class SimulatedSuccess extends Failure {}

@NodeType({ implements: [Result, Failure] })
export class SimulatedFailure extends Failure {
  @Field(() => [String])
  validationErrors: string[];
}

@NodeType({ implements: [Result, Success] })
export class OptimisticSuccess extends Success {}

@NodeInterface({ implements: [Result] })
export class Confirmed extends Result {
  @Field(() => GraphQLBigInt)
  block: bigint;

  @DecimalField()
  ethFeePerGas: Decimal;

  @DecimalField()
  networkEthFee: Decimal;
}

@NodeType({ implements: [Result, Confirmed, Success] })
export class ConfirmedSuccess extends IntersectionType(Confirmed, Success) {}

@NodeType({ implements: [Result, Confirmed, Failure] })
export class ConfirmedFailure extends IntersectionType(Confirmed, Failure) {}

@NodeType({ implements: [Result] })
export class Scheduled extends Result {
  @Field(() => Date)
  scheduledFor: Date;

  @Field(() => Boolean)
  cancelled: boolean;
}
