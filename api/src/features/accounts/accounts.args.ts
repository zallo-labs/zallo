import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { PolicyInput } from '../policies/policies.args';
import { TransferDirection } from '@gen/prisma/transfer-direction.enum';

@ArgsType()
export class AccountArgs {
  @AddressField()
  address: Address;
}

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
  address: Address;

  name: string;
}

@ArgsType()
export class AccountTransfersArgs {
  direction?: TransferDirection;

  @Field(() => Number, { nullable: true, defaultValue: 100 })
  skip: number;
}
