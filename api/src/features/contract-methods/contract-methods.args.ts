import { ArgsType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';

@ArgsType()
export class ContractMethodArgs {
  @AddressField()
  contract: Address;

  @BytesField()
  sighash: string;
}
