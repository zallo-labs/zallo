import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLDecimal } from 'prisma-graphql-type-decimal';
import { Decimal } from '@prisma/client/runtime/library';
import { Proposal } from '../proposals/proposals.model';
import { Bytes32Field, BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';

@ObjectType()
export class Transaction {
  @Bytes32Field()
  hash: string; // Hex

  @Field(() => Proposal, { nullable: false })
  proposal?: Proposal;

  @Bytes32Field()
  proposalId: string; // Hex

  @Field(() => GraphQLDecimal)
  gasLimit: Decimal;

  @Field(() => GraphQLDecimal, { nullable: true })
  gasPrice: Decimal | null;

  createdAt: Date;

  receipt?: TransactionReceipt | null;
}

@ObjectType()
export class TransactionReceipt {
  @Field(() => Transaction, { nullable: false })
  transaction?: Transaction;

  @Bytes32Field()
  transactionHash: string; // Hex

  success: boolean;

  @BytesField({ nullable: true })
  response: string | null; // Hex | null

  @Field(() => GraphQLDecimal, { nullable: false })
  gasUsed: Decimal;

  @Field(() => GraphQLDecimal, { nullable: false })
  gasPrice: Decimal;

  @Field(() => GraphQLDecimal, { nullable: false })
  fee: Decimal;

  blockNumber: number;

  timestamp: Date;

  transfers?: Transfer[];
}
