import { ArgsType, InputType } from '@nestjs/graphql';
import { Address, Approver as SafeApprover } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field } from '~/apollo/scalars/Bytes32.scalar';
import { GroupInput } from '../groups/groups.args';

@InputType()
export class ApproverInput implements SafeApprover {
  @AddressField()
  addr: Address;

  weight: number;
}

@ArgsType()
export class UpsertSafeArgs {
  @AddressField()
  safe: Address;

  @Bytes32Field({ nullable: true })
  deploySalt?: string;

  name?: string;

  groups?: GroupInput[];
}
