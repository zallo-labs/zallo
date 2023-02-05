import { ArgsType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class UserArgs {
  @AddressField({ nullable: true, description: 'Defaults to user' })
  id?: Address;
}

@ArgsType()
export class UpdateUserArgs {
  name?: string | null;

  pushToken?: string | null;
}
