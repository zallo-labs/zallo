import { Field } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';
import { Transaction } from '../transactions/transactions.model';
import { Node, NodeType } from '~/decorators/interface.decorator';
import { createUnionType } from '@nestjs/graphql';
import e from '~/edgeql-js';
import { makeUnionTypeResolver } from '../database/database.util';
import { Message } from '../messages/messages.model';
import { Approver } from '../approvers/approvers.model';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { Address, Hex, UAddress } from 'lib';
import { ChainField } from '~/apollo/scalars/Chain.scalar';
import { Chain } from 'chains';
import { GraphQLBigInt } from 'graphql-scalars';
import { UrlField } from '~/apollo/scalars/Url.scalar';

@NodeType()
export class Account extends Node {
  @UAddressField()
  address: UAddress;

  @Field(() => String)
  label: string;

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

  @Field(() => [Transfer])
  transfers: Transfer[];

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
