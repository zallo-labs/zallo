import { FindManyContactArgs } from '@gen/contact/find-many-contact.args';
import { ArgsType, OmitType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class ContactArgs {
  @AddressField()
  addr: Address;
}

@ArgsType()
export class ContactsArgs extends OmitType(FindManyContactArgs, ['where']) {}

@ArgsType()
export class UpsertContactArgs {
  @AddressField({ nullable: true })
  prevAddr?: Address;

  @AddressField()
  newAddr: Address;

  name: string;
}
