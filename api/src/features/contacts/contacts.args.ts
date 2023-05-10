import { ArgsType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class ContactArgs {
  @AddressField()
  address: Address;
}

@ArgsType()
export class UpsertContactArgs {
  @AddressField({ nullable: true })
  previousAddress?: Address;

  @AddressField()
  address: Address;

  name: string;
}
