import { Field } from '@nestjs/graphql';
import { Node, NodeType } from '~/common/decorators/interface.decorator';
import { BytesScalar } from '~/common/scalars/Bytes.scalar';
import { Hex } from 'lib';
import { Transfer } from '../transfers/transfers.model';

@NodeType()
export class Simulation extends Node {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => [BytesScalar])
  responses: Hex[];

  @Field(() => [Transfer])
  transfers: Transfer[];

  @Field(() => Date)
  timestamp: Date;
}
