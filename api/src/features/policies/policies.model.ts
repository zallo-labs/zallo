import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Account } from '../accounts/accounts.model';
import { Proposal } from '../proposals/proposals.model';
import { User } from '../users/users.model';
import { IdField } from '~/apollo/scalars/Id.scalar';

@ObjectType()
export class Policy {
  @IdField()
  id: string;

  @Field(() => Account, { nullable: false })
  account?: Account;

  key: number; // PolicyKey;

  name: string;

  state?: PolicyState | null;

  draft?: PolicyState | null;

  stateHistory?: PolicyState[];

  isActive: boolean;
}

@ObjectType()
export class PolicyState {
  @IdField()
  id: string;

  proposal?: Proposal | null;

  isAccountInitState: boolean;

  approvers?: User[];

  threshold: number;

  targets?: Target[];

  isRemoved: boolean;

  @Field(() => GraphQLBigInt, { nullable: true })
  activationBlocNumber?: bigint;

  createdAt: Date;
}

@ObjectType()
export class Target {
  @IdField()
  id: string;

  to: string; // Address | '*'

  selectors: string[]; // (Bytes4 | '*')[]
}
