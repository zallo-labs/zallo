import { ArgsType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { AccountInput } from '../accounts/accounts.args';

@ArgsType()
export class UpsertSafeArgs {
  @AddressField()
  safe: Address;

  @Bytes32Field({ nullable: true })
  deploySalt?: string;

  @AddressField()
  impl?: Address;

  name?: string;

  accounts?: AccountInput[];
}
