import { InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class UserInput {
  @AddressField({ nullable: true, description: 'Defaults to user' })
  address?: Address;
}

@InputType()
export class UpdateUserInput {
  name?: string | null;

  pushToken?: string | null;
}
