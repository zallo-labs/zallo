import { Field, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { CustomNode, CustomNodeType, Node, NodeType } from '~/decorators/interface.decorator';

@CustomNodeType()
export class FeesPerGas extends CustomNode {
  @DecimalField()
  maxPriorityFeePerGas: Decimal;

  @DecimalField()
  maxFeePerGas: Decimal;

  @Field(() => Number)
  feeTokenDecimals: number;
}

export interface PaymasterFeeParts {
  activation: Decimal;
}

@ObjectType()
export class PaymasterFees implements PaymasterFeeParts {
  @DecimalField()
  total: Decimal;

  @DecimalField()
  activation: Decimal;
}
