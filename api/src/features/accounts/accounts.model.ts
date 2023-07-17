import { Field, ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy } from '../policies/policies.model';
import { Proposal, TransactionProposal } from '../proposals/proposals.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@ObjectType()
export class Account {
  @IdField()
  id: uuid;

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
