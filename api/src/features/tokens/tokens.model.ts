import { Field, ObjectType } from '@nestjs/graphql';
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
}

@ObjectType()
export class TokenUnit {
  @Field(() => String)
  symbol: string;

  @Field(() => Number)
  decimals: number;
}
