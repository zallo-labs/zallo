import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { BigNumberish } from 'ethers';
import { Approver as SafeApprover } from 'lib';

@ArgsType()
export class CreateCfSafeArgs {
  @Field(() => [ApproverInput])
  approvers: ApproverInput[];
}

@InputType()
export class ApproverInput implements SafeApprover {
  @Field()
  addr: string;

  @Field(() => String)
  weight: BigNumberish;
}
