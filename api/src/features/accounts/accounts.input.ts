import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { UAddress } from 'lib';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { PolicyInput } from '../policies/policies.input';
import { UAddressField, UAddressScalar } from '~/apollo/scalars/UAddress.scalar';
import { Chain } from 'chains';
import { ChainField } from '~/apollo/scalars/Chain.scalar';
import { UrlField } from '~/apollo/scalars/Url.scalar';

@InputType()
export class AccountInput {
  @UAddressField({ nullable: true, description: 'Defaults to random user account' })
  account?: UAddress;
}

@InputType()
export class AccountsInput {
  @ChainField({ nullable: true })
  chain?: Chain;
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
  @Field(() => [UAddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts',
  })
  accounts?: UAddress[];

  @Field(() => AccountEvent, { nullable: true, description: 'Defaults to all events' })
  events?: AccountEvent[];
}

@InputType()
export class CreateAccountInput {
  @ChainField({ defaultValue: 'zksync-sepolia' })
  chain: Chain;

  @Field(() => String)
  label: string;

  @Field(() => [PolicyInput], { middleware: [minLengthMiddleware(1)] })
  policies: PolicyInput[];
}

@InputType()
export class UpdateAccountInput {
  @UAddressField()
  account: UAddress;

  @Field(() => String)
  label: string;

  @UrlField({ nullable: true })
  photo?: string;
}
