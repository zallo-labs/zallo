import { Field, InputType, IntersectionType, PartialType } from '@nestjs/graphql';
import { Address, Hex, PolicyId, PolicyKey, Selector } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { GraphQLBigInt } from 'graphql-scalars';
import { Bytes32Field, SelectorField } from '~/apollo/scalars/Bytes.scalar';

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
  includeRemoved: boolean;
}

@InputType()
export class TransfersConfigInput {
  @Field(() => [TransferLimitInput], { defaultValue: [] })
  limits: TransferLimitInput[];

  @Field(() => Boolean, { defaultValue: true })
  defaultAllow: boolean;

  @Field(() => Number, { nullable: true, description: 'Defaults to the policy budget' })
  budget: number;
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
export class SelectorInput {
  @SelectorField()
  selector: Selector;

  @Field(() => Boolean)
  allow: boolean;
}

@InputType()
export class TargetInput {
  @Field(() => [SelectorInput], { defaultValue: [] })
  functions: SelectorInput[];

  @Field(() => Boolean, { defaultValue: true })
  defaultAllow: boolean;
}

@InputType()
export class ContractTargetInput extends TargetInput {
  @AddressField()
  contract: Address;
}

@InputType()
export class TargetsConfigInput {
  @Field(() => [ContractTargetInput], { defaultValue: [] })
  contracts: ContractTargetInput[];

  @Field(() => TargetInput, { defaultValue: { functions: [], defaultAllow: true } })
  default: TargetInput;
}

@InputType()
export class PermissionsInput {
  @Field(() => TargetsConfigInput, { nullable: true, description: 'Targets that can be called' })
  targets?: TargetsConfigInput;

  @Field(() => TransfersConfigInput, { nullable: true })
  transfers?: TransfersConfigInput;
}

@InputType()
export class PolicyInput {
  @PolicyKeyField({ nullable: true })
  key?: PolicyKey;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [AddressScalar], {
    nullable: true,
    description: 'Signers that are required to approve',
  })
  approvers: Address[];

  @Field(() => Number, { nullable: true, description: 'Defaults to all approvers' })
  threshold?: number;

  @Field(() => PermissionsInput, { defaultValue: {} })
  permissions: PermissionsInput;
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
