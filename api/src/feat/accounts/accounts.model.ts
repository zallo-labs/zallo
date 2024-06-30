import { Field, registerEnumType } from '@nestjs/graphql';
import { AddressField } from '~/common/scalars/Address.scalar';
import { Bytes32Field } from '~/common/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';
import { Transaction } from '../transactions/transactions.model';
import { CustomNodeType, Node, NodeType } from '~/common/decorators/interface.decorator';
import { createUnionType } from '@nestjs/graphql';
import e from '~/edgeql-js';
import { makeUnionTypeResolver } from '~/core/database';
import { Message } from '../messages/messages.model';
import { Approver } from '../approvers/approvers.model';
import { UAddressField } from '~/common/scalars/UAddress.scalar';
import { Address, Hex, UAddress } from 'lib';
import { ChainField } from '~/common/scalars/Chain.scalar';
import { Chain } from 'chains';
import { GraphQLBigInt } from 'graphql-scalars';
import { UrlField } from '~/common/scalars/Url.scalar';
import { Labelled } from '~/feat/contacts/contacts.model';

@NodeType({ implements: Labelled })
export class Account extends Node {
  @UAddressField()
  address: UAddress;

  @Field(() => String)
  name: string;

  @AddressField()
  implementation: Address;

  @Bytes32Field()
  salt: Hex;

  @Field(() => GraphQLBigInt, { nullable: true })
  upgradedAtBlock?: bigint;

  @UrlField({ nullable: true })
  photo?: string;

  @ChainField()
  chain: Chain;

  @Field(() => Boolean)
  active: boolean;

  @Field(() => [Policy])
  policies: Policy[];

  @Field(() => [Proposal])
  proposals: Proposal[];

  @Field(() => [Transaction])
  transactions: Transaction[];

  @Field(() => [Message])
  messages: Message[];

  @Field(() => [Approver])
  approvers: Approver[];
}

export const Activity = createUnionType({
  name: 'Activity',
  types: () => [Transaction, Message, Transfer] as const,
  resolveType: makeUnionTypeResolver([
    [e.Transaction, Transaction],
    [e.Message, Message],
    [e.Transfer, Transfer],
  ]),
});

export enum AccountEvent {
  created,
  updated,
  upgraded,
}
registerEnumType(AccountEvent, { name: 'AccountEvent' });

@CustomNodeType()
export class AccountUpdated {
  @Field(() => AccountEvent)
  event: AccountEvent;

  @Field(() => Account)
  account: Account;
}
