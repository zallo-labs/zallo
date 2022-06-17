import { ArgsType, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';

@ArgsType()
export class SubmissionsArgs {
  @AddressField()
  safe: Address;

  @Bytes32Field()
  txHash: string;
}

@InputType()
export class SubmissionInput {
  @Bytes32Field()
  hash: string;
}

@ArgsType()
export class SubmitTxExecutionArgs extends SubmissionsArgs {
  submission: SubmissionInput;
}
