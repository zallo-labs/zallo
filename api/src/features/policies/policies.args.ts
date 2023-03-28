import { FindManyPolicyArgs } from '@gen/policy/find-many-policy.args';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  Address,
  ApprovalsRule,
  FunctionsRule,
  isPresent,
  Policy,
  PolicyGuid,
  PolicyKey,
  Selector,
  TargetsRule,
} from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { SelectorScalar } from '~/apollo/scalars/Bytes.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';

@ArgsType()
export class UniquePolicyArgs implements PolicyGuid {
  @AddressField()
  account: Address;

  @PolicyKeyField()
  key: PolicyKey;
}

@ArgsType()
export class PoliciesArgs extends FindManyPolicyArgs {}

@InputType()
export class RulesInput {
  @Field(() => [AddressScalar], {
    nullable: true,
    description: 'Signers that are required to approve',
  })
  approvers?: Address[];

  @Field(() => [SelectorScalar], { nullable: true, description: 'Functions that can be called' })
  onlyFunctions?: Selector[];

  @Field(() => [AddressScalar], { nullable: true, description: 'Addresses that can be called' })
  onlyTargets?: Address[];

  static asPolicy(key: PolicyKey, rules: RulesInput): Policy {
    return new Policy(
      key,
      ...[
        rules.approvers?.length ? new ApprovalsRule(rules.approvers) : null,
        rules.onlyFunctions?.length ? new FunctionsRule(rules.onlyFunctions) : null,
        rules.onlyTargets?.length ? new TargetsRule(rules.onlyTargets) : null,
      ].filter(isPresent),
    );
  }
}

@InputType()
export class PolicyInput {
  name?: string;

  rules: RulesInput;
}

@ArgsType()
export class CreatePolicyArgs {
  @AddressField()
  account: Address;

  name?: string;

  rules: RulesInput;
}

@ArgsType()
export class UpdatePolicyArgs extends UniquePolicyArgs {
  name?: string;

  rules?: RulesInput;
}
