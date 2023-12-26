import { Field } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { CustomNode, CustomNodeType } from '~/decorators/interface.decorator';

@CustomNodeType()
export class FeesPerGas extends CustomNode {
  @DecimalField()
  maxPriorityFeePerGas: Decimal;

  @DecimalField()
  maxFeePerGas: Decimal;

  @Field(() => Number)
  feeTokenDecimals: number;
}
