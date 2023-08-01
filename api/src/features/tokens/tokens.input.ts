import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class TokenInput {
  @AddressField()
  address: Address;
}

@InputType()
export class TokensInput {
  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Boolean, { nullable: true })
  feeToken?: boolean;
}

@InputType()
export class UpsertTokenInput {
  @AddressField()
  address: Address;

  @AddressField({ nullable: true })
  ethereumAddress?: Address;

  @Field(() => String)
  name?: string;

  @Field(() => String)
  symbol?: string;

  @Field(() => Number)
  decimals?: number;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => [TokenUnitInput], { defaultValue: [] })
  units: TokenUnitInput[];
}

@InputType()
export class TokenUnitInput {
  @Field(() => String)
  symbol: string;

  @Field(() => Number)
  decimals: number;
}

@InputType()
export class BalanceInput {
  @AddressField()
  account?: Address;
}
