import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { ArgsType, InputType, OmitType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { UserInput } from '../users/users.args';

@ArgsType()
export class AccountArgs {
  @AddressField()
  id: Address;
}

@InputType()
export class UserWithoutAccountInput extends OmitType(UserInput, [
  'id',
] as const) {
  @AddressField()
  device: Address;
}

@ArgsType()
export class FindAccountsArgs extends OmitType(FindManyAccountArgs, [
  'where',
] as const) {}

@ArgsType()
export class CreateAccountArgs {
  @AddressField()
  account: Address;

  @Bytes32Field({ nullable: true })
  deploySalt?: string;

  @AddressField()
  impl: Address;

  name: string;

  users: UserWithoutAccountInput[];
}

@ArgsType()
export class SetAccountNameArgs {
  @AddressField()
  id: Address;

  name: string;
}
