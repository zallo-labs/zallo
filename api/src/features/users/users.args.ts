import { LimitPeriod } from '@gen/prisma/limit-period.enum';
import { FindManyUserArgs } from '@gen/user/find-many-user.args';
import { InputType, Field, ArgsType, OmitType } from '@nestjs/graphql';
import { BigNumber } from 'ethers';
import { Address } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { BigNumberField } from '~/apollo/scalars/BigNumber.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { SetField } from '~/apollo/scalars/SetField';

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
  @SetField(() => AddressScalar)
  approvers: Set<Address>;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  spendingAllowlisted: boolean;

  @Field(() => [TokenLimitInput], { nullable: true, defaultValue: [] })
  limits: TokenLimitInput[];
}

@InputType()
export class UserIdInput {
  @AddressField()
  account: Address;

  @AddressField()
  device: Address;
}

@InputType()
export class UserInput {
  id: UserIdInput;
  name: string;
  configs: UserConfigInput[];
}

@ArgsType()
export class FindUniqueUserArgs {
  id: UserIdInput;
}

@ArgsType()
export class FindUsersArgs extends OmitType(FindManyUserArgs, ['where'] as const) {}

@ArgsType()
export class UpsertUserArgs {
  user: UserInput;

  @Bytes32Field()
  proposalId: string;
}

@ArgsType()
export class RemoveUserArgs {
  id: UserIdInput;

  @Bytes32Field({ nullable: true })
  proposalId?: string;
}

@ArgsType()
export class SetUserNameArgs {
  id: UserIdInput;
  name: string;
}
