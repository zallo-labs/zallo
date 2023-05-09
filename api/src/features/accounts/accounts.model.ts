import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import type { Account as EqlAccount } from '~/edgeql-interfaces';

@ObjectType()
export class Account /*implements EqlAccount*/ {
  @IdField()
  id: string;

  @AddressField()
  address: string; // Address;

  name?: string | null;

  isActive: boolean;

  @AddressField()
  implementation: string; // Address

  @Bytes32Field()
  salt: string; // Hex

  policies: Policy[];

  proposals: Proposal[];

  // TODO: transactionProposals: TransactionProposals; may be unnecessary

  transfers: Transfer[];
}
