import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UAddress } from 'lib';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';

@ObjectType()
export class Price {
  @Field(() => ID)
  id: string;

  @UAddressField()
  token: UAddress;

  @Field(() => Number)
  current: number;
}
