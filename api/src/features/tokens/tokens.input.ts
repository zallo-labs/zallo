import { Field, InputType } from '@nestjs/graphql';
import { Chain } from 'chains';
import { GraphQLInt } from 'graphql';
import { Hex, PolicyKey, UAddress, UUID } from 'lib';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { ChainField } from '~/apollo/scalars/Chain.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { UAddressField, UAddressScalar } from '~/apollo/scalars/UAddress.scalar';
import { UUIDField } from '~/apollo/scalars/Uuid.scalar';

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

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  symbol?: string;

  @Field(() => GraphQLInt, { nullable: true })
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

  @Field(() => GraphQLInt)
  decimals: number;
}

@InputType()
export class BalanceInput {
  @UAddressField({ nullable: true })
  account?: UAddress;

  @UUIDField({ nullable: true })
  transaction?: UUID;
}

@InputType()
export class SpendingInput {
  @UAddressField()
  account: UAddress;

  @PolicyKeyField({ nullable: true })
  policyKey?: PolicyKey;

  @Field(() => Date, { nullable: true })
  since?: Date;
}
