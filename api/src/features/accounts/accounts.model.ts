import { Field } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';
import { TransactionProposal } from '../transaction-proposals/transaction-proposals.model';
import { Node, NodeType } from '~/decorators/interface.decorator';
import { createUnionType } from '@nestjs/graphql';
import e from '~/edgeql-js';
import { makeUnionTypeResolver } from '../database/database.util';
import { MessageProposal } from '../message-proposals/message-proposals.model';

@NodeType()
export class Account extends Node {
  @AddressField()
  address: string; // Address;

  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  isActive: boolean;

  @AddressField()
  implementation: string; // Address

  @Bytes32Field()
  salt: string; // Hex

  @Field(() => [Policy])
  policies: Policy[];

  @Field(() => [Proposal])
  proposals: Proposal[];

  @Field(() => [TransactionProposal])
  transactionProposals: TransactionProposal[];

  @Field(() => [Transfer])
  transfers: Transfer[];
}

export const Activity = createUnionType({
  name: 'Activity',
  types: () => [TransactionProposal, MessageProposal, Transfer] as const,
  resolveType: makeUnionTypeResolver([
    [e.TransactionProposal, TransactionProposal],
    [e.MessageProposal, MessageProposal],
    [e.Transfer, Transfer],
  ]),
});
