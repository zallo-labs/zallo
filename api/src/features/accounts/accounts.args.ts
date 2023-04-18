import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { PolicyInput } from '../policies/policies.args';

@ArgsType()
export class AccountArgs {
  @AddressField()
  id: Address;
}

@ArgsType()
export class AccountsArgs extends FindManyAccountArgs {}

export const ACCOUNT_SUBSCRIPTION = 'account';
export const USER_ACCOUNT_SUBSCRIPTION = `${ACCOUNT_SUBSCRIPTION}.user`;

export enum AccountEvent {
  create,
  update,
}
registerEnumType(AccountEvent, { name: 'AccountEvent' });

@ArgsType()
export class AccountSubscriptionFilters {
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
  id: Address;

  @Field(() => String)
  name: string;
}

export enum TransferDirection {
  IN,
  OUT,
}
registerEnumType(TransferDirection, { name: 'TransferDirection' });

@ArgsType()
export class AccountTransfersArgs {
  @Field(() => TransferDirection, { nullable: true })
  direction?: TransferDirection;

  @Field(() => Number, { nullable: true, defaultValue: 100 })
  skip: number;
}
