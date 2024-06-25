import { InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/common/scalars/Address.scalar';
import { BytesField } from '~/common/scalars/Bytes.scalar';

@InputType()
export class ContractFunctionInput {
  @AddressField()
  contract: Address;

  @BytesField()
  selector: string;
}
