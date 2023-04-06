import { FindManyPolicyArgs } from '@gen/policy/find-many-policy.args';
import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { Address, PolicyId, PolicyKey, Selector } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { SelectorScalar } from '~/apollo/scalars/Bytes.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';

@ArgsType()
export class UniquePolicyArgs implements PolicyId {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
}

@ArgsType()
export class PoliciesArgs extends FindManyPolicyArgs {}

@InputType()
export class TargetInput {
  @AddressField({ description: 'Address of target' })
  to: Address;

  @Field(() => [SelectorScalar], { description: 'Functions that can be called on target' })
  selectors: Selector[];
}

@InputType()
export class PermissionsInput {
  @Field(() => [TargetInput], { nullable: true, description: 'Targets that can be called' })
  targets?: TargetInput[];
}

@InputType()
export class PolicyInput {
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

@ArgsType()
export class CreatePolicyArgs extends PolicyInput {
  @AddressField()
  account: Address;
}

@ArgsType()
export class UpdatePolicyArgs extends PartialType(PolicyInput) {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
}
