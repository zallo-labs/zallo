import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { PolicyInput } from '../policies/policies.input';
import { GraphQLURL } from 'graphql-scalars';

@InputType()
export class AccountInput {
  @AddressField({ nullable: true, description: 'Defaults to random user account' })
  address?: Address;
}

@InputType()
export class LabelAvailableInput {
  @Field(() => String)
  label: string;
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
  label: string;

  @Field(() => [PolicyInput], { middleware: [minLengthMiddleware(1)] })
  policies: PolicyInput[];
}

@InputType()
export class UpdateAccountInput {
  @AddressField()
  address: Address;

  @Field(() => String)
  label: string;

  @Field(() => GraphQLURL, { nullable: true })
  photoUri?: URL;
}

@InputType()
export class ActivityInput {
  @AddressField()
  address: Address;
}
