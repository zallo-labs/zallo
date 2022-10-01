import { ArgsType, InputType } from '@nestjs/graphql';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';

@ArgsType()
export class SubmissionsArgs {
  @Bytes32Field()
  proposalHash: string;
}

@InputType()
export class SubmissionInput {
  @Bytes32Field()
  hash: string;
}

@ArgsType()
export class SubmitExecutionArgs extends SubmissionsArgs {
  submission: SubmissionInput;
}
