import { InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { BytesField } from '~/apollo/scalars/Bytes.scalar';

@InputType()
export class ContractFunctionInput {
  @AddressField()
  contract: Address;

  @BytesField()
  selector: string;
}
