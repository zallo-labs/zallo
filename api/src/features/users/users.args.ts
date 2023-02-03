import { ArgsType, ObjectType, OmitType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { User as BaseUser } from '@gen/user/user.model';

@ObjectType()
export class User extends OmitType(BaseUser, ['pushToken']) {}

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
