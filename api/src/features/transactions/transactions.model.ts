import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { TransactionProposal } from '../proposals/proposals.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';
import { Receipt } from '../receipts/receipts.model';

@ObjectType()
export class Transaction {
  @IdField()
  id: uuid;

  @Bytes32Field()
  hash: string; // Hex

  proposal: TransactionProposal;

  @Field(() => GraphQLBigInt)
  gasPrice: bigint;

  submittedAt: Date;

  receipt?: Receipt | null;
}
