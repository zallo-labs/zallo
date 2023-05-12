import { InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class RequestTokensInput {
  @AddressField()
  account: Address;
}
