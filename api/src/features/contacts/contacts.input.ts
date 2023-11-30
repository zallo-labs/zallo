import { Field, InputType } from '@nestjs/graphql';
import { UAddress } from 'lib';
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
