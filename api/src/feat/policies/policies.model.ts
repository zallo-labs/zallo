import { Field, ObjectType, createUnionType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Account } from '../accounts/accounts.model';
import { Transaction } from '../transactions/transactions.model';
import * as eql from '~/edgeql-interfaces';
import { Address, PolicyKey, Selector, UAddress } from 'lib';
import { Approver } from '../approvers/approvers.model';
import {
  CustomNodeType,
  Err,
  ErrorType,
  Node,
  NodeInterface,
  NodeType,
} from '~/common/decorators/interface.decorator';
import { AbiFunction } from 'abitype';
import { makeUnionTypeResolver } from '~/core/database';
import e from '~/edgeql-js';
import {
  AddressField,
  SelectorField,
  AbiFunctionField,
  PolicyKeyField,
  UAddressField,
} from '~/common/scalars';

@NodeType()
export class ActionFunction extends Node implements eql.ActionFunction {
  @AddressField({ nullable: true, description: 'Default: apply to all contracts' })
  contract: Address | null;

  @SelectorField({ nullable: true, description: 'Default: apply to all selectors' })
  selector: Selector | null;

  @AbiFunctionField({ nullable: true })
  abi: AbiFunction | null;
}

@NodeType()
export class Action extends Node implements eql.Action {
  @Field(() => String)
  label: string;

  @Field(() => [ActionFunction])
  functions: [ActionFunction, ...ActionFunction[]];

  @Field(() => Boolean)
  allow: boolean;

  @Field(() => String, { nullable: true })
  description: string | null;
}

@NodeType()
export class TransferLimit extends Node {
  @AddressField()
  token: Address;

  @Field(() => GraphQLBigInt)
  amount: bigint;

  @Field(() => Number, { description: 'seconds' })
  duration: number;
}

@NodeType()
export class TransfersConfig extends Node implements eql.TransfersConfig {
  @Field(() => [TransferLimit])
  limits: TransferLimit[];

  @Field(() => Boolean)
  defaultAllow: boolean;

  @Field(() => Number)
  budget: number;
}

@NodeInterface()
export class PolicyState extends Node {
  @Field(() => Account)
  account: Account;

  @PolicyKeyField()
  key: PolicyKey;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Transaction, { nullable: true })
  proposal?: Transaction | null;

  @Field(() => GraphQLBigInt, { nullable: true })
  activationBlock?: bigint | null;

  @Field(() => Boolean)
  initState: boolean;

  @Field(() => Boolean)
  hasBeenActive: boolean;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean)
  isDraft: boolean;

  @Field(() => Policy, { nullable: true })
  latest?: Policy | null;

  @Field(() => PolicyState, { nullable: true })
  draft?: PolicyState | null;
}

@NodeType({ implements: [PolicyState] })
export class Policy extends PolicyState {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  threshold: number;

  @Field(() => [Approver])
  approvers: Approver[];

  @Field(() => [Action])
  actions: Action[];

  @Field(() => TransfersConfig)
  transfers: TransfersConfig;

  @Field(() => Boolean)
  allowMessages: boolean;

  @Field(() => Number, { description: 'seconds' })
  delay: number;
}

@NodeType({ implements: [PolicyState] })
export class RemovedPolicy extends PolicyState {}

@ObjectType()
export class ValidationError {
  @Field(() => String)
  reason: string;

  @Field(() => Number, { nullable: true })
  operation?: number;
}

@ErrorType()
export class NameTaken extends Err {}

export const UpdatePolicyDetailsResponse = createUnionType({
  name: 'UpdatePolicyDetailsResponse',
  types: () => [Policy, NameTaken],
  resolveType: makeUnionTypeResolver([[e.Policy, Policy]]),
});
export type UpdatePolicyDetailsResponse = typeof UpdatePolicyDetailsResponse;

export enum PolicyEvent {
  created,
  updated,
  activated,
  removed,
}
registerEnumType(PolicyEvent, { name: 'PolicyEvent' });

@CustomNodeType()
export class PolicyUpdated {
  @Field(() => PolicyEvent)
  event: PolicyEvent;

  @UAddressField()
  account: UAddress;

  @Field(() => Policy)
  policy: Policy;
}
