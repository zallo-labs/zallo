import { Field, InputType, IntersectionType, PartialType } from '@nestjs/graphql';
import { Address, Hex, PolicyId, PolicyKey, Selector } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { GraphQLBigInt } from 'graphql-scalars';
import { Bytes32Field, SelectorField } from '~/apollo/scalars/Bytes.scalar';
import { AbiFunctionField } from '~/apollo/scalars/AbiFunction.scalar';
import { AbiFunction } from 'abitype';

@InputType()
export class UniquePolicyInput implements PolicyId {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
}

@InputType()
export class PoliciesInput {
  @Field(() => Boolean, { defaultValue: false })
  includeDisabled: boolean;
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
}

@InputType()
export class CreatePolicyInput extends PolicyInput {
  @AddressField()
  account: Address;
}

@InputType()
export class UpdatePolicyInput extends IntersectionType(
  UniquePolicyInput,
  PartialType(PolicyInput),
) {}

@InputType()
export class SatisfiabilityInput {
  @Bytes32Field()
  proposal: Hex;
}
