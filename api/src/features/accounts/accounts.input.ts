import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { PolicyInput } from '../policies/policies.input';

@InputType()
export class AccountInput {
  @AddressField()
  address: Address;
}

export enum AccountEvent {
  create,
  update,
}
registerEnumType(AccountEvent, { name: 'AccountEvent' });

@InputType()
export class AccountSubscriptionInput {
  @Field(() => [AddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts',
  })
  accounts?: Address[];

  @Field(() => AccountEvent, { nullable: true, description: 'Defaults to all events' })
  events?: AccountEvent[];
}

@InputType()
export class CreateAccountInput {
  @Field(() => String)
  name: string;

  @Field(() => [PolicyInput], { middleware: [minLengthMiddleware(1)] })
  policies: PolicyInput[];
}

@InputType()
export class UpdateAccountInput {
  @AddressField()
  address: Address;

  name: string;
}
