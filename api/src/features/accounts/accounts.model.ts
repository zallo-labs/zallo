import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy, PolicyState } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import type { Account as EqlAccount } from '~/edgeql-interfaces';

@ObjectType()
export class Account implements EqlAccount {
  @IdField()
  id: string;

  @AddressField()
  address: string; // Address;

  @AddressField()
  implementation: string; // Address

  @Bytes32Field()
  salt: string; // Hex

  name?: string | null;

  isActive: boolean;

  policies: Policy[];

  policyStates: PolicyState[];

  proposals: Proposal[];

  transfers: Transfer[];
}
