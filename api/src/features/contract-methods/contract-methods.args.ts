import { ArgsType } from '@nestjs/graphql';
import { IsHexadecimal } from 'class-validator';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@ArgsType()
export class ContractMethodArgs {
  @AddressField()
  contract: Address;

  @IsHexadecimal()
  sighash: string;
}
