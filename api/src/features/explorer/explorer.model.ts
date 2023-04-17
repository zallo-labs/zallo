import { ObjectType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';

@ObjectType()
export class Transfer {
  @AddressField()
  token: Address;

  @AddressField()
  from: Address;

  @AddressField()
  to: Address;

  @Uint256Field()
  amount: bigint;
}
