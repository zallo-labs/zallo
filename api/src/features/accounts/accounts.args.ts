import { Account } from '@gen/account/account.model';
import { FindManyAccountArgs } from '@gen/account/find-many-account.args';
import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { SetField } from '~/apollo/scalars/SetField';
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

export interface AccountSubscriptionPayload {
  [ACCOUNT_SUBSCRIPTION]: Account;
  event: AccountEvent;
}

@ArgsType()
export class AccountSubscriptionFilters {
  @SetField(() => AddressScalar, { nullable: true, description: 'Defaults to user accounts' })
  accounts?: Set<Address>;

  @SetField(() => AccountEvent, { nullable: true, description: 'Defaults to all events' })
  events?: Set<AccountEvent>;
}

@ArgsType()
export class CreateAccountArgs {
  name: string;

  @Field(() => [PolicyInput], { middleware: [minLengthMiddleware(1)] })
  policies: PolicyInput[];
}

@ArgsType()
export class UpdateAccountArgs extends AccountArgs {
  name: string;
}
