import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class TokenInput {
  @AddressField()
  testnetAddress: Address;
}

@InputType()
export class UpsertTokenInput {
  @AddressField()
  testnetAddress: Address;

  @AddressField({ nullable: true })
  mainnetAddress?: Address;

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => Number)
  decimals: number;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => [TokenUnit], { defaultValue: [] })
  units: TokenUnit[];
}

@InputType()
export class TokenUnit {
  @Field(() => String)
  symbol: string;

  @Field(() => Number)
  decimals: number;
}
