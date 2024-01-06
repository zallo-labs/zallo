import { createUnionType, Field } from '@nestjs/graphql';

import { Chain } from 'chains';
import { Address, UAddress } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { ChainField } from '~/apollo/scalars/Chain.scalar';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';
import e from '~/edgeql-js';
import { Approver } from '../approvers/approvers.model';
import { makeUnionTypeResolver } from '../database/database.util';
import { MessageProposal } from '../message-proposals/message-proposals.model';
import { Policy } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';
import { TransactionProposal } from '../transaction-proposals/transaction-proposals.model';
import { Transfer } from '../transfers/transfers.model';

@NodeType()
export class Account extends Node {
  @UAddressField()
  address: UAddress;

  @Field(() => String)
  label: string;

  @Field(() => Boolean)
  isActive: boolean;

  @AddressField()
  implementation: Address;

  @Bytes32Field()
  salt: string; // Hex

  @Field(() => String, { nullable: true })
  photoUri?: string;

  @ChainField()
  chain: Chain;

  @Field(() => [Policy])
  policies: Policy[];

  @Field(() => [Proposal])
  proposals: Proposal[];

  @Field(() => [TransactionProposal])
  transactionProposals: TransactionProposal[];

  @Field(() => [Transfer])
  transfers: Transfer[];

  @Field(() => [Approver])
  approvers: Approver[];
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
