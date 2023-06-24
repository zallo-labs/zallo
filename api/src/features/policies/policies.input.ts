import { Field, InputType, IntersectionType, PartialType } from '@nestjs/graphql';
import { Address, PolicyId, PolicyKey, Selector } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { GraphQLBigInt } from 'graphql-scalars';

@InputType()
export class UniquePolicyInput implements PolicyId {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
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
export class PermissionsInput {
  @Field(() => [TargetInput], { nullable: true, description: 'Targets that can be called' })
  targets?: TargetInput[];

  @Field(() => TransfersConfigInput, { nullable: true })
  transfers?: TransfersConfigInput;
}

@InputType()
export class TargetInput {
  @Field(() => String, { description: 'Address of target (or *)' })
  to: Address | '*';

  @Field(() => [String], { description: 'Functions that can be called on target (or *)' })
  selectors: (Selector | '*')[];
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

  @Field(() => PermissionsInput)
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
