import { Field } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class FeesPerGas extends Node {
  @DecimalField()
  maxPriorityFeePerGas: Decimal;

  @DecimalField()
  maxFeePerGas: Decimal;

  @Field(() => Number)
  feeTokenDecimals: number;
}
