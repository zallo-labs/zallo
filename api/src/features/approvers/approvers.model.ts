import { Field, registerEnumType } from '@nestjs/graphql';
import { GraphQLMAC } from 'graphql-scalars';

import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Node, NodeType } from '~/decorators/interface.decorator';
import * as eql from '~/edgeql-interfaces';

@NodeType()
export class Approver extends Node implements Partial<eql.Approver> {
  @AddressField()
  address: Address;

  @Field(() => String, { nullable: true })
  label?: string;
}

export enum CloudProvider {
  Apple = 'Apple',
  Google = 'Google',
}
registerEnumType(CloudProvider, { name: 'CloudProvider' });

@NodeType()
export class CloudShare extends Node {
  @Field(() => CloudProvider)
  provider: CloudProvider;

  @Field(() => String)
  subject: string;

  // share is hidden
}

@NodeType()
export class UserApprover extends Approver {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  pushToken?: string;

  @Field(() => [GraphQLMAC], { nullable: true })
  bluetoothDevices?: string[];

  @Field(() => CloudShare, { nullable: true })
  cloud?: CloudShare;
}
