import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Address, Approver } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';

@InputType()
export class ApproverInput implements Approver {
  @AddressField()
  addr: Address;

  weight: number;
}

@InputType()
export class GroupInput {
  @Bytes32Field()
  ref: string;

  @Field(() => [ApproverInput])
  approvers: ApproverInput[];

  name: string;
}

@ArgsType()
export class UpsertGroupArgs {
  @AddressField()
  safe: Address;

  group: GroupInput;
}
