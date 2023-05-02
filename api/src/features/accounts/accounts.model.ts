import { ObjectType } from '@nestjs/graphql';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Transfer } from '../transfers/transfers.model';
import { Policy, PolicyState } from '../policies/policies.model';
import { Proposal } from '../proposals/proposals.model';

@ObjectType()
export class Account {
  @AddressField()
  id: string; // Address

  @AddressField()
  impl: string; // Address

  @Bytes32Field()
  deploySalt: string; // Hex

  name: string;

  isActive: boolean;

  policies?: Policy[];

  policyStates?: PolicyState[];

  proposals?: Proposal[];

  transfers?: Transfer[];
}
