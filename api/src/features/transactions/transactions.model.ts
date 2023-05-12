import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Proposal } from '../proposals/proposals.model';
import { Bytes32Field, BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class Transaction {
  @IdField()
  id: uuid;

  @Bytes32Field()
  hash: string; // Hex

  proposal: Proposal;

  @Field(() => GraphQLBigInt)
  gasPrice: bigint;

  submittedAt: Date;

  receipt?: Receipt;
}

@ObjectType()
export class Receipt {
  success: boolean;

  @BytesField({ nullable: true })
  response?: string; // Hex

  transfers: Transfer[];

  @Field(() => GraphQLBigInt)
  gasUsed: bigint;

  @Field(() => GraphQLBigInt)
  fee: bigint;

  @Field(() => GraphQLBigInt)
  block: bigint;

  timestamp: Date;
}
