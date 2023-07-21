import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Token extends Node {
  @AddressField()
  address: Address;

  @AddressField({ nullable: true })
  ethereumAddress?: Address;

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => Number)
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

  @Field(() => Number)
  decimals: number;
}

@ObjectType()
export class TokenMetadata {
  @Field(() => ID)
  id: string;

  @AddressField({ nullable: true })
  ethereumAddress?: string | null;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  symbol?: string;

  @Field(() => Number, { nullable: true })
  decimals?: number;

  @Field(() => String, { nullable: true })
  iconUri?: string | null;
}
