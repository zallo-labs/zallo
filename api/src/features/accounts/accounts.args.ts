import { ArgsType, InputType, OmitType } from '@nestjs/graphql';
import { Address, DeploySalt } from 'lib';
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
export class CreateAccountArgs {
  @AddressField()
  account: Address;

  @AddressField()
  impl: Address;

  @Bytes32Field()
  deploySalt: DeploySalt;

  name: string;

  users: UserWithoutAccountInput[];
}

@ArgsType()
export class SetAccountNameArgs {
  @AddressField()
  id: Address;

  name: string;
}
