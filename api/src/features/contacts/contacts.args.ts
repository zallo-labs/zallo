import { FindManyContactArgs } from '@gen/contact/find-many-contact.args';
import { ArgsType, Field, OmitType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Address } from 'lib';
import { AddressField, IsAddress } from '~/util/IsAddr';

@ArgsType()
export class Contacts2Args extends OmitType(FindManyContactArgs, ['where']) {}

@ArgsType()
export class DeleteContactArgs {
  @AddressField()
  addr: Address;
}

@ArgsType()
export class UpsertContactArgs {
  // @IsOptional()
  // @Field(() => String, { nullable: true })
  @AddressField({ optional: true })
  prevAddr?: Address;

  @AddressField()
  newAddr: Address;

  name: string;
}
