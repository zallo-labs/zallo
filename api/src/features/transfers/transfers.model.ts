import { Extensions, Field, InterfaceType, IntersectionType, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { uuid } from 'edgedb/dist/codecs/ifaces';

import { Address, UAddress } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import e from '~/edgeql-js';
import { Account } from '../accounts/accounts.model';
import { EventBase } from '../events/events.model';
import { Token } from '../tokens/tokens.model';

@InterfaceType()
export class TransferDetails {
  @IdField()
  id: uuid;

  @Field(() => Account)
  account: Account;

  @AddressField()
  from: Address;

  @AddressField()
  to: Address;

  @UAddressField()
  tokenAddress: UAddress;

  @Field(() => Token, { nullable: true })
  token: Token;

  @DecimalField()
  amount: Decimal;

  @Field(() => Boolean)
  isFeeTransfer: boolean;
}

@InterfaceType({ implements: [EventBase, TransferDetails] })
export class Transferlike extends IntersectionType(EventBase, TransferDetails) {}

@ObjectType({ implements: Transferlike })
@Extensions({ eqlType: e.Transfer, select: { __type__: { id: true, name: true } } })
export class Transfer extends Transferlike {}

@ObjectType({ implements: Transferlike })
@Extensions({ eqlType: e.TransferApproval, select: { __type__: { id: true, name: true } } })
export class TransferApproval extends Transferlike {
  @DecimalField()
  delta: Decimal;
}
