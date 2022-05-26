import { FindManyContactArgs } from '@gen/contact/find-many-contact.args';
import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Address, Id } from 'lib';
import { AddressField } from '~/util/IsAddr';

@ArgsType()
export class Contacts2Args extends OmitType(FindManyContactArgs, ['where']) {}

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
  @AddressField({ optional: true })
  prevAddr?: Address;

  @AddressField()
  newAddr: Address;

  name: string;
}
