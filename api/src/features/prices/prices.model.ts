import { Field, ID, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';

@ObjectType()
export class Price {
  @Field(() => ID)
  id: string;

  @DecimalField()
  current: Decimal;

  @DecimalField()
  ema: Decimal;
}

@ObjectType()
export class Pricefeed {
  @Field(() => ID)
  id: string;

  @Field(() => Price)
  usd: Price;

  @Field(() => Price)
  eth: Price;
}
