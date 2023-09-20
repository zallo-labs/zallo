import { Extensions, Field, InterfaceType, IntersectionType } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { GraphQLBigInt } from 'graphql-scalars';
import { EventBase } from '../events/events.model';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { Token } from '../tokens/tokens.model';

@InterfaceType()
export class TransferDetails {
  @IdField()
  id: uuid;

  @Field(() => Account)
  account: Account;

  @AddressField()
  from: string; // Address

  @AddressField()
  to: string; // Address

  @AddressField()
  tokenAddress: string; // Address

  @Field(() => Token, { nullable: true })
  token: Token;

  @Field(() => GraphQLBigInt)
  amount: bigint;
}

@InterfaceType({ implements: [EventBase, TransferDetails] })
export class Transferlike extends IntersectionType(EventBase, TransferDetails) {}

@ObjectType({ implements: Transferlike })
@Extensions({ eqlType: e.Transfer, select: { __type__: { id: true, name: true } } })
export class Transfer extends Transferlike {}

@ObjectType({ implements: Transferlike })
@Extensions({ eqlType: e.TransferApproval, select: { __type__: { id: true, name: true } } })
export class TransferApproval extends Transferlike {
  @Field(() => GraphQLBigInt)
  delta: bigint;
}
