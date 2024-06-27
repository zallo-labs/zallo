import { ArgsType, Field, InputType, IntersectionType, PartialType } from '@nestjs/graphql';
import { Address, PolicyId, PolicyKey, Selector, UAddress, UUID } from 'lib';
import { GraphQLBigInt } from 'graphql-scalars';
import { AbiFunction } from 'abitype';
import {
  UAddressField,
  PolicyKeyField,
  IdField,
  AddressField,
  SelectorField,
  AbiFunctionField,
  AddressScalar,
  UAddressScalar,
} from '~/common/scalars';
import { PolicyEvent } from './policies.model';

@InputType()
export class UniquePolicyInput implements PolicyId {
  @UAddressField()
  account: UAddress;

  @PolicyKeyField()
  key: PolicyKey;
}

@ArgsType()
export class PolicyStateArgs {
  @IdField()
  id: UUID;
}

@InputType()
export class ActionFunctionInput {
  @AddressField({ nullable: true, description: 'Default: apply to all contracts' })
  contract?: Address;

  @SelectorField({ nullable: true, description: 'Default: apply to all selectors' })
  selector?: Selector;

  @AbiFunctionField({ nullable: true })
  abi?: AbiFunction;
}

@InputType()
export class ActionInput {
  @Field(() => String)
  label: string;

  @Field(() => [ActionFunctionInput])
  functions: ActionFunctionInput[];

  @Field(() => Boolean)
  allow: boolean;

  @Field(() => String, { nullable: true })
  description?: string;
}

@InputType()
export class TransfersConfigInput {
  @Field(() => [TransferLimitInput], { defaultValue: [] })
  limits: TransferLimitInput[];

  @Field(() => Boolean, { defaultValue: true })
  defaultAllow: boolean;

  @Field(() => Number, { nullable: true, description: 'Defaults to the policy budget' })
  budget?: number;
}

@InputType()
export class TransferLimitInput {
  @AddressField()
  token: Address;

  @Field(() => GraphQLBigInt)
  amount: bigint;

  @Field(() => Number, { description: 'seconds' })
  duration: number;
}

@InputType()
export class PolicyInput {
  @PolicyKeyField({ nullable: true })
  key?: PolicyKey;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [AddressScalar], { nullable: true })
  approvers: Address[];

  @Field(() => Number, { nullable: true })
  threshold?: number;

  @Field(() => [ActionInput], { nullable: true })
  actions?: ActionInput[];

  @Field(() => TransfersConfigInput, { nullable: true })
  transfers?: TransfersConfigInput;

  @Field(() => Boolean, { nullable: true })
  allowMessages?: boolean;

  @Field(() => Number, { nullable: true, description: 'seconds' })
  delay?: number;
}

@InputType()
export class CreatePolicyInput extends PolicyInput {
  @UAddressField()
  account: UAddress;
}

@InputType()
export class UpdatePolicyInput extends IntersectionType(
  UniquePolicyInput,
  PartialType(PolicyInput),
) {}

@InputType()
export class UpdatePoliciesInput {
  @UAddressField()
  account: UAddress;

  @Field(() => [UpdatePolicyInput])
  policies: UpdatePolicyInput[];
}

@ArgsType()
export class ValidationErrorsArgs {
  @IdField()
  proposal: UUID;
}

@InputType()
export class PolicyUpdatedInput {
  @Field(() => [UAddressScalar], { nullable: true })
  accounts?: UAddress[];

  @Field(() => PolicyEvent, { nullable: true, description: 'Defaults to all events' })
  events?: PolicyEvent[];
}
