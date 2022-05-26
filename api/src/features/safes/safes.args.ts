import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Address, Approver as SafeApprover } from 'lib';

@ArgsType()
export class CreateCfSafeArgs {
  @Field(() => [ApproverInput])
  approvers: ApproverInput[];
}

@InputType()
export class ApproverInput implements SafeApprover {
  @Field()
  addr: Address;

  @Field(() => String)
  weight: number;
}
