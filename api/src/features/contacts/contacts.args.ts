import { FindManyContactArgs } from '@gen/contact/find-many-contact.args';
import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Address, Id } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class ContactsArgs extends OmitType(FindManyContactArgs, ['where']) {}

@ArgsType()
export class DeleteContactArgs {
  @AddressField()
  addr: Address;
}

@ObjectType()
export class DeleteContactResp {
  @Field(() => String)
  id: Id;
}

@ArgsType()
export class UpsertContactArgs {
  @AddressField({ nullable: true })
  prevAddr?: Address;

  @AddressField()
  newAddr: Address;

  name: string;
}
