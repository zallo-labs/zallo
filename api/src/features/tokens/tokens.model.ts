import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';
import { Hex, UAddress } from 'lib';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Token extends Node {
  @UAddressField()
  address: UAddress;

  @Bytes32Field({ nullable: true })
  pythUsdPriceId?: Hex;

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => GraphQLInt)
  decimals: number;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => [TokenUnit], { nullable: true })
  units?: TokenUnit[];

  @Field(() => Boolean)
  isFeeToken: boolean;

  @Field(() => Boolean)
  removable: boolean;
}

@ObjectType()
export class TokenUnit {
  @Field(() => String)
  symbol: string;

  @Field(() => GraphQLInt)
  decimals: number;
}

@ObjectType()
export class TokenMetadata {
  @Field(() => ID)
  id: string;

  @Bytes32Field({ nullable: true })
  pythUsdPriceId?: Hex;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  symbol?: string;

  @Field(() => GraphQLInt, { nullable: true })
  decimals?: number;

  @Field(() => String, { nullable: true })
  iconUri?: string | null;
}
