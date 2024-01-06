import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJWT, GraphQLMAC } from 'graphql-scalars';

import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class ApproverInput {
  @AddressField({ nullable: true, description: 'Defaults to current approver' })
  address?: Address;
}

@InputType()
export class UniqueCloudShareInput {
  @Field(() => GraphQLJWT)
  idToken: string;
}

@InputType()
export class CloudShareInput {
  @Field(() => GraphQLJWT)
  idToken: string;

  @Field(() => String)
  share: string;
}

@InputType()
export class UpdateApproverInput extends ApproverInput {
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  pushToken?: string | null;

  @Field(() => [GraphQLMAC], { nullable: true })
  bluetoothDevices?: string[];

  @Field(() => CloudShareInput, { nullable: true })
  cloud?: CloudShareInput;
}
