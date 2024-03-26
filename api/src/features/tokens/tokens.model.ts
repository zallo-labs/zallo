import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';
import { Hex, UAddress } from 'lib';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { UrlField } from '~/apollo/scalars/Url.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Token extends Node {
  @UAddressField()
  address: UAddress;

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => GraphQLInt)
  decimals: number;

  @UrlField({ nullable: true })
  icon?: string;

  @Field(() => [TokenUnit], { nullable: true })
  units?: TokenUnit[];

  @Bytes32Field({ nullable: true })
  pythUsdPriceId?: Hex;

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

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => GraphQLInt)
  decimals: number;

  @UrlField({ nullable: true })
  icon?: string | null;

  @Bytes32Field({ nullable: true })
  pythUsdPriceId?: Hex;
}
