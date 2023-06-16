import { Field, registerEnumType } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { Receipt } from '../receipts/receipts.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class TransferDetails {
  @IdField()
  id: string;

  @Field(() => Account)
  account: Account;

  @Field(() => TransferDirection)
  direction: TransferDirection;

  @AddressField()
  from: string; // Address

  @AddressField()
  to: string; // Address

  @AddressField()
  token: string; // Address

  @Field(() => GraphQLBigInt)
  amount: bigint;
}

@ObjectType()
export class Transfer extends TransferDetails {
  @Field(() => Receipt, { nullable: true })
  receipt?: Receipt | null;

  @Field(() => Number)
  logIndex: number;

  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => Date)
  timestamp: Date;
}

export enum TransferDirection {
  In = 'In',
  Out = 'Out',
}
registerEnumType(TransferDirection, { name: 'TransferDirection' });
