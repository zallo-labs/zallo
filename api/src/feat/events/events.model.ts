import { Field } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Bytes32Field } from '~/common/scalars/Bytes.scalar';
import { Hex } from 'lib';
import { Node, NodeInterface } from '~/common/decorators/interface.decorator';
import { Result } from '../system-txs/results.model';
import { Account } from '../accounts/accounts.model';

@NodeInterface()
export class Event extends Node {
  @Field(() => Account)
  account: Account;

  @Bytes32Field()
  systxHash: Hex;

  @Field(() => Result, { nullable: true })
  result?: Result;

  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => Number)
  logIndex: number;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => Boolean)
  internal: boolean;

  @Field(() => Boolean)
  confirmed: boolean;
}
