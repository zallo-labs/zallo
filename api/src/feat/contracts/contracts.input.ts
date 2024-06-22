import { InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/common/scalars/Address.scalar';

@InputType()
export class ContractInput {
  @AddressField()
  contract: Address;
}
