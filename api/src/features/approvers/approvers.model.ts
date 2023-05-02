import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { PolicyState } from '../policies/policies.model';
import { User } from '../users/users.model';

@ObjectType()
export class Approver {
  state: PolicyState;

  @Field(() => GraphQLBigInt)
  stateId: bigint;

  user: User;

  @AddressField()
  userId: string; // Address
}
