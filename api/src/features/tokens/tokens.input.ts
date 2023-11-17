import { Field, InputType } from '@nestjs/graphql';
import { Address, UAddress } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { UAddressField, UAddressScalar } from '~/apollo/scalars/UAddress.scalar';

@InputType()
export class TokenInput {
  @UAddressField()
  address: UAddress;
}

@InputType()
export class TokensInput {
  @Field(() => [UAddressScalar], { nullable: true })
  address?: UAddress[];

  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Boolean, { nullable: true })
  feeToken?: boolean;
}

@InputType()
export class UpsertTokenInput {
  @UAddressField()
  address: UAddress;

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
  @UAddressField()
  account?: UAddress;
}
