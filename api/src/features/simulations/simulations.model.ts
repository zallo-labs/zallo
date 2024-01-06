import { Field, ObjectType } from '@nestjs/graphql';

import { Hex } from 'lib';
import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';
import { TransferDetails } from '../transfers/transfers.model';

@ObjectType({ implements: TransferDetails })
export class SimulatedTransfer extends TransferDetails {}

@NodeType()
export class Simulation extends Node {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => [BytesScalar])
  responses: Hex[];

  @Field(() => [SimulatedTransfer])
  transfers: SimulatedTransfer[];

  @Field(() => Date)
  timestamp: Date;
}
