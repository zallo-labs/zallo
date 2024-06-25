import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { Chain } from 'chains';
import { GraphQLInt } from 'graphql';
import { Hex, PolicyKey, UAddress, UUID } from 'lib';
import { Bytes32Field } from '~/common/scalars/Bytes.scalar';
import { ChainField } from '~/common/scalars/Chain.scalar';
import { PolicyKeyField } from '~/common/scalars/PolicyKey.scalar';
import { UAddressField, UAddressScalar } from '~/common/scalars/UAddress.scalar';
import { UrlField } from '~/common/scalars/Url.scalar';

@ArgsType()
export class TokenArgs {
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

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  symbol?: string;

  @UrlField({ nullable: true })
  icon?: string;

  @Field(() => [TokenUnitInput], { nullable: true })
  units?: TokenUnitInput[] | null;

  @Bytes32Field({ nullable: true })
  pythUsdPriceId?: Hex;
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

  @Field(() => ID, { nullable: true })
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
