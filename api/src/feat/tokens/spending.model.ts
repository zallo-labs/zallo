import { Field, ObjectType } from '@nestjs/graphql';
import { DecimalField } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { Transferlike } from '../transfers/transfers.model';

@ObjectType()
export class TokenSpending {
  @Field(() => [Transferlike])
  transfers: Transferlike[];

  @Field(() => Date)
  since: Date;

  @DecimalField()
  spent: Decimal;

  @DecimalField({ nullable: true })
  limit?: Decimal;

  @DecimalField({ nullable: true })
  remaining?: Decimal;
}
