import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Chain, UAddress } from 'lib';
import { minLengthMiddleware } from '~/apollo/scalars/util';
import { PolicyInput } from '../policies/policies.input';
import { GraphQLURL } from 'graphql-scalars';
import { UAddressField, UAddressScalar } from '~/apollo/scalars/UAddress.scalar';

@InputType()
export class AccountInput {
  @UAddressField({ nullable: true, description: 'Defaults to random user account' })
  account?: UAddress;
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

const ChainEnum = {
  zksync: 'zksync',
  zksync_goerli: 'zksync-goerli',
  zksync_local: 'zksync-local',
} satisfies Record<string, Chain>;
registerEnumType(ChainEnum, { name: 'Chain' });

@InputType()
export class CreateAccountInput {
  @Field(() => ChainEnum, { nullable: true, defaultValue: ChainEnum['zksync_goerli'] })
  chain?: Chain;

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

  @Field(() => GraphQLURL, { nullable: true })
  photoUri?: URL;
}
