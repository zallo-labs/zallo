import { InputType } from '@nestjs/graphql';
import { UAddress } from 'lib';
import { UAddressField } from '~/common/scalars/UAddress.scalar';

@InputType()
export class EstimateFeesPerGasInput {
  @UAddressField()
  feeToken: UAddress;
}
