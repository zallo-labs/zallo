import { ObjectType, Field } from '@nestjs/graphql';
import { TransferDetails } from '../transfers/transfers.model';
import { Node, NodeType } from '~/decorators/interface.decorator';

@ObjectType({ implements: TransferDetails })
export class SimulationTransfer extends TransferDetails {}

@NodeType()
export class Simulation extends Node {
  @Field(() => [SimulationTransfer])
  transfers: SimulationTransfer[];
}
