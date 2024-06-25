import { Field } from '@nestjs/graphql';
import { TransferDetails } from '../transfers/transfers.model';
import { Node, NodeType } from '~/common/decorators/interface.decorator';
import { BytesScalar } from '~/common/scalars/Bytes.scalar';
import { Hex } from 'lib';

@NodeType({ implements: TransferDetails })
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
