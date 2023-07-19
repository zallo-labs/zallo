import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ObjectType()
export class Price {
  @Field(() => ID)
  id: string;

  @AddressField()
  token: Address;

  @Field(() => Number)
  current: number;
}
