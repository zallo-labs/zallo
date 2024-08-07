import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { GraphQLMAC, GraphQLJWT } from 'graphql-scalars';
import { Address } from 'lib';
import { AddressField } from '~/common/scalars/Address.scalar';
import { CloudProvider } from './approvers.model';

@ArgsType()
export class ApproverArgs {
  @AddressField({ nullable: true, description: 'Defaults to current approver' })
  address?: Address;
}

@InputType()
export class UniqueCloudShareInput {
  @Field(() => GraphQLJWT)
  idToken: string;
}

@InputType()
export class CloudInput {
  @Field(() => CloudProvider)
  provider: CloudProvider;

  @Field(() => String)
  subject: string;
}

@InputType()
export class UpdateApproverInput {
  @AddressField({ nullable: true, description: 'Defaults to current approver' })
  address?: Address;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  pushToken?: string | null;

  @Field(() => [GraphQLMAC], { nullable: true })
  bluetoothDevices?: string[];

  @Field(() => CloudInput, { nullable: true })
  cloud?: CloudInput | null;
}
