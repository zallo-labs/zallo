import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class Receipt {
  @IdField()
  id: uuid;

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
