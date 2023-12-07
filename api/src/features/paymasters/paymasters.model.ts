import { Field, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';

@ObjectType()
export class FeesPerGas {
  @DecimalField()
  maxPriorityFeePerGas: Decimal;

  @DecimalField()
  maxFeePerGas: Decimal;

  @Field(() => Number)
  decimals: number;
}
