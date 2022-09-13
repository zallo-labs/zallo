import { LimitPeriod } from '@gen/prisma/limit-period.enum';
import { FindManyUserArgs } from '@gen/user/find-many-user.args';
import { InputType, Field, ArgsType, OmitType } from '@nestjs/graphql';
import { BigNumber } from 'ethers';
import { Address } from 'lib';
import { AddressField, GqlAddress } from '~/apollo/scalars/Address.scalar';
import { BigNumberField } from '~/apollo/scalars/BigNumber.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';

@InputType()
export class TokenLimitInput {
  @AddressField()
  token: Address;

  @BigNumberField()
  amount: BigNumber;

  period: LimitPeriod;
}

@InputType()
export class UserConfigInput {
  @Field(() => [GqlAddress])
  approvers: Address[];

  spendingAllowlisted: boolean;

  limits: TokenLimitInput[];
}

export class UserIdInput {
  @AddressField()
  account: Address;

  @AddressField()
  device: Address;
}

@InputType()
export class UserInput extends UserIdInput {
  name: string;

  configs: UserConfigInput[];
}

@ArgsType()
export class FindUniqueUserArgs extends UserIdInput {}

@ArgsType()
export class FindUsersArgs extends OmitType(FindManyUserArgs, [
  'where',
] as const) {}

@ArgsType()
export class UpsertUserArgs {
  user: UserInput;

  @Bytes32Field()
  proposalHash: string;
}

@ArgsType()
export class RemoveUserArgs extends UserIdInput {
  @Bytes32Field()
  proposalHash: string;
}

@ArgsType()
export class SetUserNameArgs extends UserIdInput {
  name: string;
}
