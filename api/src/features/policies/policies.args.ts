import { FindManyPolicyArgs } from '@gen/policy/find-many-policy.args';
import { ArgsType, InputType } from '@nestjs/graphql';
import {
  Address,
  ApprovalsRule,
  FunctionRule,
  isPresent,
  Policy,
  PolicyGuid,
  PolicyKey,
  Selector,
  TargetRule,
} from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { SelectorScalar } from '~/apollo/scalars/Bytes.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { SetField } from '~/apollo/scalars/SetField';

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
  @SetField(() => AddressScalar, {
    nullable: true,
    description: 'Signers that are required to approve',
  })
  approvers?: Set<Address>;

  @SetField(() => SelectorScalar, { nullable: true, description: 'Functions that can be called' })
  onlyFunctions?: Set<Selector>;

  @SetField(() => AddressScalar, { nullable: true, description: 'Addresses that can be called' })
  onlyTargets?: Set<Address>;

  static asPolicy(key: PolicyKey, rules: RulesInput): Policy {
    return new Policy(
      key,
      ...[
        rules.approvers?.size ? new ApprovalsRule(rules.approvers) : null,
        rules.onlyFunctions?.size ? new FunctionRule(rules.onlyFunctions) : null,
        rules.onlyTargets?.size ? new TargetRule(rules.onlyTargets) : null,
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
export class CreatePolicyArgs extends PolicyInput {
  @AddressField()
  account: Address;
}

@ArgsType()
export class UpdatePolicyArgs extends UniquePolicyArgs {
  name?: string;

  rules?: RulesInput;
}
