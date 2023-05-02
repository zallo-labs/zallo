import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Account } from '../accounts/accounts.model';
import { Proposal } from '../proposals/proposals.model';
import { Approver } from '../approvers/approvers.model';

@ObjectType()
export class Policy {
  @Field(() => Account, { nullable: false })
  account?: Account;

  @AddressField()
  accountId: string; // Address

  @Field(() => GraphQLBigInt)
  key: bigint;

  name: string;

  active?: PolicyState | null;

  @Field(() => GraphQLBigInt, { nullable: true })
  activeId: bigint | null;

  draft?: PolicyState | null;

  @Field(() => GraphQLBigInt, { nullable: true })
  draftId: bigint | null;

  states?: PolicyState[];
}

@ObjectType()
export class PolicyState {
  @Field(() => GraphQLBigInt)
  id: bigint;

  @Field(() => Account, { nullable: false })
  account?: Account;

  accountId: string;

  @Field(() => Policy, { nullable: false })
  policy?: Policy;

  @Field(() => GraphQLBigInt)
  policyKey: bigint;

  proposal?: Proposal | null;

  proposalId: string | null;

  createdAt: Date;

  isRemoved: boolean;

  activeOf?: Policy | null;

  draftOf?: Policy | null;

  approvers?: Approver[];

  threshold: number;

  targets?: Target[];
}

@ObjectType()
export class Target {
  state: PolicyState;

  @Field(() => GraphQLBigInt)
  stateId: bigint;

  to: string; // Address | '*'

  selectors: string[]; // (Bytes4 | '*')[]
}
