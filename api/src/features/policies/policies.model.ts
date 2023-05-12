import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Account } from '../accounts/accounts.model';
import { TransactionProposal } from '../proposals/proposals.model';
import { User } from '../users/users.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@ObjectType()
export class Policy {
  @IdField()
  id: uuid;

  account: Account;

  key: number; // PolicyKey;

  name: string;

  state?: PolicyState | null;

  draft?: PolicyState | null;

  stateHistory: PolicyState[];

  isActive: boolean;
}

@ObjectType()
export class PolicyState {
  @IdField()
  id: uuid;

  proposal?: TransactionProposal | null;

  isAccountInitState: boolean;

  approvers: User[];

  threshold: number;

  targets: Target[];

  isRemoved: boolean;

  @Field(() => GraphQLBigInt, { nullable: true })
  activationBlock?: bigint | null;

  createdAt: Date;
}

@ObjectType()
export class Target implements eql.Target {
  @IdField()
  id: uuid;

  to: string; // Address | '*'

  selectors: string[]; // (Bytes4 | '*')[]
}
