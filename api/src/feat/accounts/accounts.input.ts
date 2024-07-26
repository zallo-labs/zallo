import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Hex, UAddress } from 'lib';
import { PolicyInput } from '../policies/policies.input';
import { Chain } from 'chains';
import {
  UAddressField,
  ChainField,
  UAddressScalar,
  UrlField,
  minLengthMiddleware,
  Bytes32Field,
} from '~/common/scalars';
import { AccountEvent } from './accounts.model';

@ArgsType()
export class AccountArgs {
  @UAddressField({ nullable: true, description: 'Defaults to random user account' })
  address?: UAddress;
}

@InputType()
export class AccountsInput {
  @ChainField({ nullable: true })
  chain?: Chain;
}

@ArgsType()
export class NameAvailableArgs {
  @Field(() => String)
  name: string;
}

@InputType()
export class AccountUpdatedInput {
  @Field(() => [UAddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts',
  })
  accounts?: UAddress[];

  @Field(() => [AccountEvent], { nullable: true, description: 'Defaults to all events' })
  events?: AccountEvent[];
}

@InputType()
export class CreateAccountInput {
  @ChainField({ defaultValue: 'zksync-sepolia' })
  chain: Chain;

  @Field(() => String)
  name: string;

  @Field(() => [PolicyInput], { middleware: [minLengthMiddleware(1)] })
  policies: PolicyInput[];

  @Bytes32Field({ nullable: true })
  salt?: Hex;
}

@InputType()
export class UpdateAccountInput {
  @UAddressField()
  account: UAddress;

  @Field(() => String)
  name: string;

  @UrlField({ nullable: true })
  photo?: string;
}
