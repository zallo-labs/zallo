import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { ArgsType, InputType, OmitType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { UserInput } from '../users/users.args';

@ArgsType()
export class AccountArgs {
  @AddressField()
  id: Address;
}

@ArgsType()
export class AccountsArgs extends FindManyAccountArgs {}

@ArgsType()
export class CreateAccountArgs {
  name: string;

  // TODO: require at least one
  users: UserWithoutAccountInput[];
}

@ArgsType()
export class SetAccountNameArgs extends AccountArgs {
  name: string;
}

@InputType()
export class UserWithoutAccountInput extends OmitType(UserInput, ['id'] as const) {
  @AddressField()
  device: Address;
}
