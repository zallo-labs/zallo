import { Field, InputType } from '@nestjs/graphql';
import { Chain } from 'chains';
import { Hex, UAddress } from 'lib';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { ChainField } from '~/apollo/scalars/Chain.scalar';
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

  @ChainField({ nullable: true })
  chain?: Chain;
}

@InputType()
export class UpsertTokenInput {
  @UAddressField()
  address: UAddress;

  @Bytes32Field({ nullable: true })
  pythUsdPriceId?: Hex;

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
