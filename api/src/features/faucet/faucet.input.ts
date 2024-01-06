import { InputType } from '@nestjs/graphql';

import { UAddress } from 'lib';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';

@InputType()
export class RequestTokensInput {
  @UAddressField()
  account: UAddress;
}
