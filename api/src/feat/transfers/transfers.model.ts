import { Extensions, Field, IntersectionType } from '@nestjs/graphql';
import { AddressField } from '~/common/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { Event } from '../events/events.model';
import e from '~/edgeql-js';
import { Token } from '../tokens/tokens.model';
import { UAddressField } from '~/common/scalars/UAddress.scalar';
import { Address, UAddress } from 'lib';
import { DecimalField } from '~/common/scalars/Decimal.scalar';
import Decimal from 'decimal.js';
import { NodeInterface, NodeType, Node } from '~/common/decorators/interface.decorator';

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

  @Field(() => Boolean)
  incoming: boolean;

  @Field(() => Boolean)
  outgoing: boolean;

  @Field(() => Boolean)
  isFeeTransfer: boolean;
}

@NodeInterface({ implements: [Event, TransferDetails] })
export class Transferlike extends IntersectionType(Event, TransferDetails) {}

@NodeType({ implements: Transferlike })
@Extensions({ eqlType: e.Transfer })
export class Transfer extends Transferlike {}

@NodeType({ implements: Transferlike })
@Extensions({ eqlType: e.TransferApproval })
export class TransferApproval extends Transferlike {
  @DecimalField()
  delta: Decimal;
}
