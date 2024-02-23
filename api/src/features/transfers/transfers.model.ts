import { Extensions, Field, InterfaceType, IntersectionType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { Event } from '../events/events.model';
import e from '~/edgeql-js';
import { Token } from '../tokens/tokens.model';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { Address, UAddress } from 'lib';
import { DecimalField } from '~/apollo/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { NodeInterface, NodeType, Node } from '~/decorators/interface.decorator';
import { TransferDirection } from './transfers.input';

@NodeInterface()
export class TransferDetails extends Node {
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

  @Field(() => [TransferDirection])
  direction: TransferDirection[];

  @Field(() => Boolean)
  isFeeTransfer: boolean;
}

@InterfaceType({ implements: [Node, Event, TransferDetails] })
export class Transferlike extends IntersectionType(Event, TransferDetails) {}

@NodeType({ implements: Transferlike })
@Extensions({ eqlType: e.Transfer, select: { __type__: { id: true, name: true } } })
export class Transfer extends Transferlike {}

@NodeType({ implements: Transferlike })
@Extensions({ eqlType: e.TransferApproval, select: { __type__: { id: true, name: true } } })
export class TransferApproval extends Transferlike {
  @DecimalField()
  delta: Decimal;
}
