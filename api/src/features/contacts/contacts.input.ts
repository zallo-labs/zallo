import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class ContactInput {
  @AddressField()
  address: Address;
}

@InputType()
export class UpsertContactInput {
  @AddressField({ nullable: true })
  previousAddress?: Address;

  @AddressField()
  address: Address;

  @Field(() => String)
  label: string;
}

@InputType()
export class LabelInput {
  @AddressField()
  address: Address;
}
