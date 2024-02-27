import { Field, InputType } from '@nestjs/graphql';
import { Chain } from 'chains';
import { UAddress } from 'lib';
import { ChainField } from '~/apollo/scalars/Chain.scalar';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';

@InputType()
export class ContactInput {
  @UAddressField()
  address: UAddress;
}

@InputType()
export class ContactsInput {
  @Field(() => String, { nullable: true })
  query?: string;

  @ChainField({ nullable: true })
  chain?: Chain;
}

@InputType()
export class UpsertContactInput {
  @UAddressField({ nullable: true })
  previousAddress?: UAddress;

  @UAddressField()
  address: UAddress;

  @Field(() => String)
  label: string;
}

@InputType()
export class LabelInput {
  @UAddressField()
  address: UAddress;
}
