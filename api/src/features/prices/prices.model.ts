import { Field } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Price extends Node {
  @DecimalField()
  current: Decimal;

  @DecimalField()
  ema: Decimal;
}

@NodeType()
export class Pricefeed extends Node {
  @Field(() => Price)
  usd: Price;

  @Field(() => Price)
  eth: Price;
}
