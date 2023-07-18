import { Field, ObjectType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';

@NodeType()
export class Token extends Node {
  @AddressField()
  mainnetAddress: Address;

  @AddressField({ nullable: true })
  testnetAddress?: Address;

  @Field(() => String)
  name: string;

  @Field(() => String)
  symbol: string;

  @Field(() => Number)
  decimals: number;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => [TokenUnit])
  units: TokenUnit[];
}

@ObjectType()
export class TokenUnit {
  @Field(() => String)
  symbol: string;

  @Field(() => Number)
  decimals: number;
}
