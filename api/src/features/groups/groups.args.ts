import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { Address } from "lib";
import { AddressField } from "~/apollo/scalars/Address.scalar";
import { Bytes32Field } from "~/apollo/scalars/Bytes32.scalar";
import { ApproverInput } from "../safes/safes.args";

@InputType()
export class GroupInput {
  @Bytes32Field()
  ref: string;

  @Field(() => [ApproverInput])
  approvers: ApproverInput[];

  name?: string;
}

@ArgsType()
export class UpsertGroupArgs {
  @AddressField()
  safe: Address;

  group: GroupInput;
}