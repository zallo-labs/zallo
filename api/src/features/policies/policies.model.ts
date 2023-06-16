import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDate } from 'graphql-scalars';
import { Account } from '../accounts/accounts.model';
import { TransactionProposal } from '../proposals/proposals.model';
import { User } from '../users/users.model';
import { IdField } from '~/apollo/scalars/Id.scalar';
import * as eql from '~/edgeql-interfaces';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';

@ObjectType()
export class Policy {
  @IdField()
  id: uuid;

  @Field(() => Account)
  account: Account;

  @PolicyKeyField()
  key: number; // PolicyKey;

  @Field(() => String)
  name: string;

  @Field(() => PolicyState, { nullable: true })
  state?: PolicyState | null;

  @Field(() => PolicyState, { nullable: true })
  draft?: PolicyState | null;

  @Field(() => [PolicyState])
  stateHistory: PolicyState[];

  @Field(() => Boolean)
  isActive: boolean;
}

@ObjectType()
export class PolicyState {
  @IdField()
  id: uuid;

  @Field(() => TransactionProposal, { nullable: true })
  proposal?: TransactionProposal | null;

  @Field(() => Boolean)
  isAccountInitState: boolean;

  @Field(() => [User])
  approvers: User[];

  @Field(() => Number)
  threshold: number;

  @Field(() => [Target])
  targets: Target[];

  @Field(() => Boolean)
  isRemoved: boolean;

  @Field(() => GraphQLBigInt, { nullable: true })
  activationBlock?: bigint | null;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Target implements eql.Target {
  @IdField()
  id: uuid;

  @Field(() => String)
  to: string; // Address | '*'

  @Field(() => [String])
  selectors: string[]; // (Bytes4 | '*')[]
}
