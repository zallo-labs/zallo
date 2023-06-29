import { Field, IntersectionType, registerEnumType } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { GraphQLBigInt } from 'graphql-scalars';
import { EventBase } from '../events/events.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@ObjectType()
export class TransferDetails {
  @IdField()
  id: uuid;

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

export enum TransferDirection {
  In = 'In',
  Out = 'Out',
}
registerEnumType(TransferDirection, { name: 'TransferDirection' });

@ObjectType({ isAbstract: true })
export class Transferlike extends IntersectionType(EventBase, TransferDetails) {}

@ObjectType()
export class Transfer extends Transferlike {}

@ObjectType()
export class TransferApproval extends Transferlike {
  @Field(() => GraphQLBigInt)
  delta: bigint;
}
