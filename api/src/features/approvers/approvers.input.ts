import { Field, InputType } from '@nestjs/graphql';
import { GraphQLMAC } from 'graphql-scalars';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class ApproverInput {
  @AddressField({ nullable: true, description: 'Defaults to current approver' })
  address?: Address;
}

@InputType()
export class UpdateApproverInput extends ApproverInput {
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  pushToken?: string | null;

  @Field(() => [GraphQLMAC], { nullable: true })
  bluetoothDevices?: string[];
}
