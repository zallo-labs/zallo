import { ArgsType, Field, InputType, IntersectionType, PartialType } from '@nestjs/graphql';
import { Address, PolicyId, PolicyKey, Selector } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';

@InputType()
export class UniquePolicyInput implements PolicyId {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
}

@InputType()
export class PolicyInput {
  @PolicyKeyField({ nullable: true })
  key?: PolicyKey;

  name?: string;

  @Field(() => [AddressScalar], {
    nullable: true,
    description: 'Signers that are required to approve',
  })
  approvers: Address[];

  @Field(() => Number, { description: 'Defaults to all approvers' })
  threshold?: number;

  permissions: PermissionsInput;
}

@InputType()
export class PermissionsInput {
  @Field(() => [TargetInput], { nullable: true, description: 'Targets that can be called' })
  targets?: TargetInput[];
}

@InputType()
export class TargetInput {
  @Field(() => String, { description: 'Address of target (or *)' })
  to: Address | '*';

  @Field(() => [String], { description: 'Functions that can be called on target (or *)' })
  selectors: (Selector | '*')[];
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
