import { Field, ObjectType } from '@nestjs/graphql';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { Transferlike } from '../transfers/transfers.model';

@ObjectType()
export class TokenSpending {
  @Field(() => [Transferlike])
  transfers: Transferlike[];

  @Field(() => Number, { description: 'seconds' })
  duration: number;

  @DecimalField()
  total: Decimal;

  @DecimalField({ nullable: true })
  limit?: Decimal;
}
