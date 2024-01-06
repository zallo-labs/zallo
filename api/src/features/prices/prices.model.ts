import { Field, ID } from '@nestjs/graphql';
import Decimal from 'decimal.js';

import { Hex } from 'lib';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { CustomNodeType } from '~/decorators/interface.decorator';

@CustomNodeType()
export class Price {
  @Field(() => ID, { description: 'Pyth USD price id' })
  id: Hex;

  @DecimalField()
  eth: Decimal;

  @DecimalField()
  ethEma: Decimal;

  @DecimalField()
  usd: Decimal;

  @DecimalField()
  usdEma: Decimal;
}
